#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { WeatherAppCdkStack } from '../lib/cdk-stack';
import { WeatherAppCdkECRStack } from '../lib/cdk-ecr-stack';

const app = new cdk.App();
new WeatherAppCdkStack(app, 'WeatherAppCdkStack', {
  env: { account: '381491975528', region: 'us-east-1' },
});

new WeatherAppCdkECRStack(app, 'WeatherAppCdkECRStack', {
  env: { account: '381491975528', region: 'us-east-1' },
})