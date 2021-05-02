import { Controller, Get, Query, Request, Route } from "@tsoa/runtime"
import {omit} from 'lodash'
import { Request as ExRequest } from "express"
import { APIService } from "../services/api.service"
import { APIData } from "../types/api.type"

@Route("/api")
export class UsersController extends Controller {
  /**
   * Proxy APIs for http://makeup-api.herokuapp.com/
   * To provide paging feature.
   */
  @Get('/v1/products.json')
  public async proxy(
    @Request() req: ExRequest,
    @Query() offset: number=0,
    @Query() limit: number=20,
  ): Promise<APIData> {
    const updatedQuery = omit(req.query, 'limit', 'offset')
    if (limit > 80) throw new Error('Maximum limit is 80')

    const data = await new APIService().get(req.path, updatedQuery)
    const sliced = data.slice(offset, offset+limit)

    return {
      ok: true,
      data: sliced,
      nextOffset: offset + limit < data.length ? offset + limit : void 0
    }
  }
}
