import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecr from 'aws-cdk-lib/aws-ecr';

export class WeatherAppCdkECRStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create Elastic Container Repository
    const backendEcrRepository = new ecr.Repository(this, 'WeatherAppBackendEcrRepository', {
      repositoryName: 'weather-app-backend',
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Optionally set the removal policy
    });

    // Create Elastic Container Repository
    const frontendEcrRepository = new ecr.Repository(this, 'WeatherAppFrontendEcrRepository', {
      repositoryName: 'weather-app-frontend',
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Optionally set the removal policy
    });

    // Output the repository URI
    new cdk.CfnOutput(this, 'RepositoryBackendUriOutput', {
      value: backendEcrRepository.repositoryUri,
      exportName: 'WeatherAppBackendRepositoryUri',
    });

    // Output the repository URI
    new cdk.CfnOutput(this, 'RepositoryFrontendUriOutput', {
      value: frontendEcrRepository.repositoryUri,
      exportName: 'WeatherAppFrontendRepositoryUri',
    });
  }
}
