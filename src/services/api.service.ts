import axios from "axios"
import {S3} from 'aws-sdk'
import * as qs from 'qs'
import to from "await-to-js"
import { difference, keys } from "lodash"
import { EMA_CACHE_BUCKET } from "../models/constants.model"

const s3 = new S3()
const Bucket = EMA_CACHE_BUCKET
const axiosInstance = axios.create({
  baseURL: 'http://makeup-api.herokuapp.com/',
})

/*
  product_type: string // The type of makeup being searched for (ie. lipstick, eyeliner). See list of product types below. Will return a list of all products of this type
  product_category: string // Sub-category for each makeup-type. (ie. lip gloss is a category of lipstick). See product types below. If a category exists it will be under 'By Category'. Will return a list of all products of this category
  product_tags: string // list separated by commas. Options each product could be tagged with. (ie. vegan). each product can have multiple tags. If tags exist it will be in the product types under 'By Tag'. Will return a list of products filtered by all tags indicated
  brand: string // Brand of the product. Will return all products for each brand
  price_greater_than: number // Will return a list of products with price greater than indicated number (exclusive)
  price_less_than: number // Will return a list of products with price less than indicated number (exclusive)
  rating_greater_than: number // Will return a list of products with a rating more than indicated number (exclusive)
  rating_less_than: number // Will return a list of products with a rating less than indicated number (exclusive)
*/
const availableQueries = [
  'product_type',
  'product_category',
  'product_tags',
  'brand',
  'price_greater_than',
  'price_less_than',
  'rating_greater_than',
  'rating_less_than',
]

export class APIService {
  public async get(pathname: string, queryParams?: any): Promise<any[]> {
    const unknownQueryNames = difference(keys(queryParams), availableQueries)
    if (unknownQueryNames.length > 0) {
      throw new Error('Unknown querystring: ' + unknownQueryNames.join(','))
    }

    const Key = keys(queryParams).length > 0
      ? pathname.replace(/^\//,'') + '?' + qs.stringify(queryParams)
      : pathname.replace(/^\//,'')

    console.log('Key: ' + Key)   // api/v1/products.json?brand=xx

    const [err,fromCache] = await to(s3.getObject({ Bucket, Key }).promise())
    if (err && (err as any)?.code !== 'NoSuchKey') throw err

    const data: any[] = fromCache
      ? JSON.parse(fromCache.Body?.toString() || '')
      : await (await axiosInstance.get(pathname, { params: queryParams })).data

    if (fromCache) console.log('S3 cache hit')
    else console.log('No cache. Called origin')

    if (!fromCache) {
      await s3.putObject({
        Bucket, Key, Body: JSON.stringify(data),
        ContentType: 'json',
      }).promise()
    }

    if (!Array.isArray(data)) throw new Error('data is not array')
    return data
  }
}
