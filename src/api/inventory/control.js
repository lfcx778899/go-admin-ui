import request from '@/utils/request'

//获取库存列表
export function getControl(query) {
  return request({
    url: '/api/inventory_control/get',
    method: 'get',
    params: query
  })
}

//获取库存列表
export function getAllControl(query) {
  return request({
    url: '/api/inventory_control/get_all',
    method: 'get',
    params: query
  })
}

//分页获取库存列表
export function getControlPage(query) {
  return request({
    url: '/api/inventory_control/get_all_by_page',
    method: 'get',
    params: query
  })
}

//分页获取库存列表
export function updateControl(id,data) {
  return request({
    url: '/api/inventory_control/update/'+id,
    method: 'put',
    data: data
  })
}
