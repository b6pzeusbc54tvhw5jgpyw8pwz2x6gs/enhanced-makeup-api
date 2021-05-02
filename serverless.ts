import type { AWS } from '@serverless/typescript'
import { Envs} from './src/types/env.type'
import { isNotEmptyString } from './src/utils/typecheck.util'
import {name} from './package.json'

const {
  ENV_REVISION, EMA_CACHE_BUCKET,
} = process.env

// Through the build-time type check here,
// environment variables can be used in runtime code without additional type checking.
if(!isNotEmptyString(ENV_REVISION)) throw new Error('Check required env: ENV_REVISION')
if(!isNotEmptyString(EMA_CACHE_BUCKET)) throw new Error('Check required env: EMA_CACHE_BUCKET')

const envs: Envs = {
  ENV_REVISION, EMA_CACHE_BUCKET,
}

const serverlessConfiguration: AWS = {
  service: name,
  frameworkVersion: '2',
  custom: {
    webpack: {
      packager: 'yarn',
      webpackConfig: './webpack.config.js',
      includeModules: {
        forceExclude: ['aws-sdk'],
      },
    },
    "serverless-offline": {
      lambdaPort: process.env.HTTP_PORT
        ? Number(process.env.HTTP_PORT) + 2
        : 3002,
    },
  },
  // Add the serverless-webpack plugin
  plugins: [
    'serverless-webpack',
    'serverless-offline',
  ],
  provider: {
    name: 'aws',
    lambdaHashingVersion: "20201221",
    runtime: 'nodejs14.x',
    apiGateway: {
      shouldStartNameWithService: true,
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      ...envs,
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: ["s3:PutObject","s3:GetObject"],
        Resource: `arn:aws:s3:::${EMA_CACHE_BUCKET}/*`
      },
      {
        Effect: "Allow",
        Action: ["s3:ListBucket"],
        Resource: `arn:aws:s3:::${EMA_CACHE_BUCKET}`
      },
    ]
  },
  functions: {
    index: {
      handler: 'src/handler.index',
      events: [
        { httpApi: '*' },
      ],
    }
  }
}

module.exports = serverlessConfiguration
