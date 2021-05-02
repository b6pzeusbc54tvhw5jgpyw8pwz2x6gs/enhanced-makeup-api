import { AWS_REGION, AWS_LAMBDA_FUNCTION_NAME, AWS_LAMBDA_FUNCTION_MEMORY_SIZE, AWS_LAMBDA_FUNCTION_VERSION, ENV_REVISION} from "../models/constants.model"
import { Version } from "../models/version.model"

export class VersionService {
  public get(): Version {
    return {
      node: process.version,
      app: ENV_REVISION,         // application revision
      AWS_REGION: AWS_REGION,
      AWS_LAMBDA_FUNCTION_NAME: AWS_LAMBDA_FUNCTION_NAME,
      AWS_LAMBDA_FUNCTION_MEMORY_SIZE: AWS_LAMBDA_FUNCTION_MEMORY_SIZE,
      AWS_LAMBDA_FUNCTION_VERSION: AWS_LAMBDA_FUNCTION_VERSION,
    }
  }
}
