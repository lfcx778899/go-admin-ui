import request from '@/utils/request'

export function getProductPage(query) {
  return request({
    url: '/api/product/get_all_by_page',
    method: 'get',
    params: query
  })
}

export function create(data) {
  return request({
    url: '/api/product/create',
    method: 'post',
    data: data
  })
}

export function deleteProduct(id) {
  return request({
    url: '/api/product/delete/' + id,
    method: 'delete'
  })
}

export function getProduct(query) {
  return request({
    url: '/api/product/get',
    method: 'get',
    params: query
  })
}

export function updateProduct(id, data) {
  return request({
    url: '/api/product/update/'+ id,
    method: 'put',
    data: data
  })
}

//获取产品列表
export function getAll() {
  return request({
    url: '/api/product/get_all',
    method: 'get',
  })
}

export function uploadProduct(data) {
  return request({
    url: '/api/product/upload',
    method: 'post',
    data: data
  })
}

export function exportProduct() {
  return request({
    url: '/api/product/download',
    method: 'post',
  })
}
