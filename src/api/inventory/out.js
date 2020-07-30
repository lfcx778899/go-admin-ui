import request from '@/utils/request'

//新建领用申请
export function createOut(data) {
  return request({
    url: '/api/inventory_control_out_requests/create',
    method: 'post',
    data: data
  })
}

//删除领用申请
export function deleteItem(id) {
  return request({
    url: '/api/inventory_control_out_requests/delete/' + id,
    method: 'delete'
  })
}

//修改领用申请
export function updateItem(id, data) {
  return request({
    url: '/api/inventory_control_out_requests/update/' + id,
    method: 'put',
    data: data
  })
}

//修改领用状态
export function updateStatus(id, data) {
  return request({
    url: '/api/inventory_control_out_requests/update_status/' + id,
    method: 'put',
    data: data
  })
}

//获取领用详情
export function getItem(query) {
  return request({
    url: '/api/inventory_control_out_requests/get',
    method: 'get',
    params: query
  })
}

//分页获取领用列表
export function getPage(query) {
  return request({
    url: '/api/inventory_control_out_requests/get_all_by_page',
    method: 'get',
    params: query
  })
}
