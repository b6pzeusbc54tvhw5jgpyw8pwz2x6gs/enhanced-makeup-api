import { Controller, Get, Query, Request, Route } from "@tsoa/runtime"
import {keys, omit} from 'lodash'
import to from "await-to-js"
import * as qs from 'qs'
import {S3} from 'aws-sdk'
import axios from "axios"
import { Request as ExRequest } from "express"
import { EMA_CACHE_BUCKET } from "../models/constants.model"

const s3 = new S3()
const Bucket = EMA_CACHE_BUCKET

@Route("/api")
export class UsersController extends Controller {
  /**
   * Proxy APIs for http://makeup-api.herokuapp.com/
   * To provide paging feature.
   */
  @Get('*')
  public async proxy(
    @Request() req: ExRequest,
    @Query() offset: number=0,
    @Query() limit: number=40,
  ): Promise<any[]> {
    const updatedQuery = omit(req.query, 'limit', 'offset')
    const Key = keys(updatedQuery).length > 0
      ? req.path.replace(/^\//,'') + '?' + qs.stringify(updatedQuery)
      : req.path.replace(/^\//,'')

    console.log('Key: ' + Key)   // api/v1/products.json
    const [err,fromCache] = await to(s3.getObject({ Bucket, Key }).promise())
    if (err && (err as any)?.code !== 'NoSuchKey') throw err

    const data: object = fromCache
      ? JSON.parse(fromCache.Body?.toString() || '')
      : (await axios.get(`http://makeup-api.herokuapp.com/${Key}`))?.data

    if (fromCache) console.log('S3 cache hit')
    else console.log('No cache. Called origin')

    if (!fromCache) {
      await s3.putObject({
        Bucket, Key, Body: JSON.stringify(data),
        ContentType: 'json',
      }).promise()
    }

    if (!Array.isArray(data)) throw new Error('data is not array')
    return data.slice(offset, offset+limit)
  }
}
