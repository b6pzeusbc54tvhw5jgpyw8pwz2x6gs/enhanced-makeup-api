import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as swaggerUi from "swagger-ui-express"
import * as morgan from 'morgan'
import { RegisterRoutes } from "./routes"
import { handle404NotFound, handleError } from './middlewares/error-handle.middleware'

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(morgan(':remote-addr - :remote-user [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'))

if (process.env.TST_SLS_STAGE !== 'prod') {
  const swaggerJson = require("./swagger.json")
  app.use('/docs', swaggerUi.serveWithOptions({redirect: false}))
  app.get('/docs', swaggerUi.setup(swaggerJson))
}

app.use('/hello', (_req,res) => res.send('world'))
RegisterRoutes(app)

app.use(handle404NotFound)
app.use(handleError)

export default app
