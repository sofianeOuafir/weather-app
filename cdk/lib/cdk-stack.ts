import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elb from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';

export class WeatherAppCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Replace with your VPC ID
    const vpcId = 'your_vpc_id'

    // Replace with the name of your EC2 key pair
    const keyName = 'your_ec2_key_pair_name'

    // Replace with your ECS Task Execution Role ARN
    const ecsExecutionTaskRoleArn = 'your_ecs_task_execution_role_arn'

    // Replace with your OpenWeatherMap API key (for local development; store securely for production)
    const openWeatherMapApiKey = 'your_openweathermap_api_key'

    // VPC
    const vpc = ec2.Vpc.fromLookup(this, vpcId, { isDefault: true });

    // ECS Cluster
    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc,
      clusterName: 'weather-app-cluster',
    });

    const albSecurityGroup = new ec2.SecurityGroup(this, 'WeatherAppAlbSecurityGroup', {
      vpc,
      securityGroupName: 'weather-app-alb-security-group',
      description: 'Security group for weather app ALB with inbound rules for HTTP and HTTPS',
      allowAllOutbound: true  // Allows all outbound traffic by default
    });

    // Allow inbound HTTP and HTTPS traffic from any IP
    albSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP traffic from any IP');
    albSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'Allow HTTPS traffic from any IP');

    // Create a new security group for EC2 instances
    const ec2SecurityGroup = new ec2.SecurityGroup(this, 'WeatherAppEc2InstanceSecurityGroup', {
      vpc,
      allowAllOutbound: true,
      description: 'Weather app Security group for EC2 instances in ECS cluster',
      securityGroupName: 'weather-app-ec2-instance-security-group'
    });

    // Allow inbound HTTP and HTTPS traffic
    ec2SecurityGroup.addIngressRule(
      ec2.Peer.securityGroupId(albSecurityGroup.securityGroupId),
      ec2.Port.tcp(3000),
      'Allow HTTP traffic from ALB'
    );
    // Allow inbound SSH traffic
    ec2SecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'Allow SSH traffic'
    );

    // Allow dynamic port range from the ALB security group
    ec2SecurityGroup.addIngressRule(
      ec2.Peer.securityGroupId(albSecurityGroup.securityGroupId),
      ec2.Port.tcpRange(32768, 65535),
      'Allow dynamic ports from ALB'
    );

    // Auto Scaling Group
    const autoScalingGroup = new autoscaling.AutoScalingGroup(this, 'ASG', {
      vpc,
      autoScalingGroupName: 'weather-app-asg',
      instanceType: new ec2.InstanceType('t2.micro'),
      machineImage: ecs.EcsOptimizedImage.amazonLinux2(),
      minCapacity: 1,
      maxCapacity: 3,
      securityGroup: ec2SecurityGroup,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      keyName, // this makes it possible to SSH into ec2 instances. Optional
    });

    // ECS Capacity Provider
    const capacityProvider = new ecs.AsgCapacityProvider(this, 'AsgCapacityProvider', {
      autoScalingGroup,
      capacityProviderName: 'weather-app-capacity-provider',
    });

    // Attach the Capacity Provider to the Cluster
    cluster.addAsgCapacityProvider(capacityProvider);

    // ECS Task Execution Role
    const ecsTaskExecutionRole = iam.Role.fromRoleArn(this, 'EcsTaskExecutionRole', ecsExecutionTaskRoleArn);

    // Task Definition
    const backendTaskDefinition = new ecs.Ec2TaskDefinition(this, 'TaskDef', {
      family: 'weather-app-task-family',
      executionRole: ecsTaskExecutionRole,
    });

    const backendRepositoryUri = cdk.Fn.importValue('WeatherAppBackendRepositoryUri')

    const backendContainer = backendTaskDefinition.addContainer('NodeContainer', {
      image: ecs.ContainerImage.fromRegistry(backendRepositoryUri + ":latest"), // Change to your image
      memoryLimitMiB: 256,
      cpu: 256,
      environment: {
        OPENWEATHERMAP_API_KEY: openWeatherMapApiKey
      },
      logging: new ecs.AwsLogDriver({
        streamPrefix: 'weather-app-node-backend',
      }),
    });

    backendContainer.addPortMappings({
      containerPort: 3000,
      name: 'weather-app-container-3000-tcp',
    });

    // ECS Service
    const backendService = new ecs.Ec2Service(this, 'Service', {
      cluster,
      taskDefinition: backendTaskDefinition,
      desiredCount: 1,
      serviceName: 'weather-app-backend-service',
    });

    // Load Balancer
    const lb = new elb.ApplicationLoadBalancer(this, 'LB', {
      vpc,
      internetFacing: true,
      loadBalancerName: 'weather-app-alb',
      securityGroup: albSecurityGroup
    });

    // Task Definition for Frontend
    const frontendTaskDefinition = new ecs.Ec2TaskDefinition(this, 'FrontendTaskDef', {
      family: 'weather-app-frontend-task-family',
      executionRole: ecsTaskExecutionRole,
    });

    const frontendRepositoryUri = cdk.Fn.importValue('WeatherAppFrontendRepositoryUri');

    const frontendContainer = frontendTaskDefinition.addContainer('FrontendContainer', {
      image: ecs.ContainerImage.fromRegistry(frontendRepositoryUri + ":latest"), // Change to your image
      memoryLimitMiB: 256,
      cpu: 256,
      environment: {
        NEXT_PUBLIC_API_URL: lb.loadBalancerDnsName,
      },
      logging: new ecs.AwsLogDriver({
        streamPrefix: 'weather-app-frontend',
      }),
    });

    frontendContainer.addPortMappings({
      containerPort: 3000,
      name: 'weather-app-frontend-container-3000-tcp',
    });

    // ECS Service for Frontend
    const frontendService = new ecs.Ec2Service(this, 'FrontendService', {
      cluster,
      taskDefinition: frontendTaskDefinition,
      desiredCount: 1,
      serviceName: 'weather-app-frontend-service',
    });

    const listener = lb.addListener('PublicListener', {
      port: 80,
      open: true,
    });

    // Target Group for Backend Service
    const backendTargetGroup = new elb.ApplicationTargetGroup(this, 'BackendTG', {
      vpc,
      targets: [backendService],
      port: 3000,
      protocol: elb.ApplicationProtocol.HTTP,
      healthCheck: {
        path: '/health',
        interval: cdk.Duration.minutes(1),
      },
    });

    // Target Group for Frontend Service
    const frontendTargetGroup = new elb.ApplicationTargetGroup(this, 'FrontendTG', {
      vpc,
      targets: [frontendService],
      port: 3000,
      protocol: elb.ApplicationProtocol.HTTP,
      healthCheck: {
        path: '/',
        interval: cdk.Duration.minutes(1),
      },
    });

    // Add default action for the listener
    listener.addTargetGroups('DefaultTargetGroup', {
      targetGroups: [frontendTargetGroup],
    });

    // Add Rules to Listener
    listener.addTargetGroups('BackendTG', {
      targetGroups: [backendTargetGroup],
      conditions: [elb.ListenerCondition.pathPatterns(['/api/*'])],
      priority: 10,
    });

    listener.addTargetGroups('FrontendTG', {
      targetGroups: [frontendTargetGroup],
      conditions: [elb.ListenerCondition.pathPatterns(['/*'])],
      priority: 20,
    });

    new cdk.CfnOutput(this, 'LoadBalancerDNS', {
      value: lb.loadBalancerDnsName,
    });
  }
}
