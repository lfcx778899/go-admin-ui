import request from '@/utils/request'

export function getPricePage(query) {
  return request({
    url: '/api/product_price/get_all_by_page',
    method: 'get',
    params: query
  })
}

export function create(data) {
  return request({
    url: '/api/product_price/create',
    method: 'post',
    data: data
  })
}

export function deleteItem(id) {
  return request({
    url: '/api/product_price/delete/' + id,
    method: 'delete'
  })
}

export function getItem(query) {
  return request({
    url: '/api/product_price/get',
    method: 'get',
    params: query
  })
}

export function updateItem(id, data) {
  return request({
    url: '/api/product_price/update/'+ id,
    method: 'put',
    data: data
  })
}

export function changeStatus(id, data) {
  return request({
    url: '/api/product_price/status/'+ id,
    method: 'put',
    data: data
  })
}
