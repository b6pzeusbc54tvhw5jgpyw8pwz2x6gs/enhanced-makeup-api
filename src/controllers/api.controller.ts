import { Controller, Get, Query, Request, Route } from "@tsoa/runtime"
import {omit, union, compact} from 'lodash'
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
  public async products(
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

  @Get('/v1/brands.json')
  public async brands(): Promise<APIData> {
    const data = await new APIService().get('api/v1/products.json')
    const brands = data.reduce((prev, current) => union([...prev, current.brand]), [])
    const compacted = compact(brands)
    return { ok: true, data: compacted }
  }

  @Get('/v1/tags.json')
  public async tags(): Promise<APIData> {
    const data = await new APIService().get('api/v1/products.json')
    const tags = data.reduce((prev, current) => union([...prev, ...current.tag_list]), [])
    const compacted = compact(tags)
    return { ok: true, data: compacted }
  }

  @Get('/v1/categories.json')
  public async categories(): Promise<APIData> {
    const data = await new APIService().get('api/v1/products.json')
    const categories = data.reduce((prev, current) => union([...prev, current.category]), [])
    const compacted = compact(categories)
    return { ok: true, data: compacted }
  }

  @Get('/v1/product_types.json')
  public async productTypes(): Promise<APIData> {
    const data = await new APIService().get('api/v1/products.json')
    const productTypes = data.reduce((prev, current) => union([...prev, current.product_type]), [])
    const compacted = compact(productTypes)
    return { ok: true, data: compacted }
  }
}
