import { generateRoutes, generateSpec } from "tsoa"
import { ExtendedSpecConfig, ExtendedRoutesConfig } from "tsoa"

(async () => {
  const specOptions: ExtendedSpecConfig = {
    "entryFile": "src/app.ts",
    "noImplicitAdditionalProperties": "throw-on-extras",
    "controllerPathGlobs": ["src/**/*-controller.ts"],
    description: `
# typescript-serverless-tsoa Example
- https://github.com/ACupofCommit/typescript-serverless-tsoa
    `.trim(),
    basePath: '/local',
    specVersion: 3,
    outputDirectory: "./src",

    securityDefinitions: {
      // https://swagger.io/docs/specification/authentication/bearer-authentication/
      // https://tsoa-community.github.io/docs/authentication.html
      bearerAuth: {
        "type": "http",
        // @ts-ignore
        scheme: "bearer",
        bearerFormat: "JWT",
      }
    },
  }

  const routeOptions: ExtendedRoutesConfig = {
    "entryFile": "src/app.ts",
    "noImplicitAdditionalProperties": "throw-on-extras",
    "controllerPathGlobs": ["src/**/*-controller.ts"],
    routesDir: "src",
    authenticationModule: './src/core/auth-middleware.ts',
  }

  await generateSpec(specOptions)
  await generateRoutes(routeOptions)
})()