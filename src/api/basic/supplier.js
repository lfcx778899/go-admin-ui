import request from '@/utils/request'

export function create(data) {
  return request({
    url: '/api/supplier/create',
    method: 'post',
    data: data
  })
}

export function getSupplierPage(query) {
  return request({
    url: '/api/supplier/get_all_by_page',
    method: 'get',
    params: query
  })
}

export function deleteSupplier(id) {
  return request({
    url: '/api/supplier/delete/' + id,
    method: 'delete'
  })
}

export function updateSupplier(id, data) {
  return request({
    url: '/api/supplier/update/' + id,
    method: 'put',
    data: data
  })
}

export function changeStatus(id, data) {
  return request({
    url: '/api/supplier/status/' + id,
    method: 'put',
    data: data
  })
}
