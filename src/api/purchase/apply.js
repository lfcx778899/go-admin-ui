import request from '@/utils/request'

//新建采购申请
export function create(data) {
  return request({
    url: '/api/purchase_request/create',
    method: 'post',
    data: data
  })
}

//删除采购申请
export function deleteItem(id) {
  return request({
    url: '/api/purchase_request/delete/' + id,
    method: 'delete'
  })
}

//修改采购申请
export function updateItem(id, data) {
  return request({
    url: '/api/purchase_request/update/' + id,
    method: 'put',
    data: data
  })
}

//获取采购申请详细信息
export function getItem(query) {
  return request({
    url: '/api/purchase_request/get',
    method: 'get',
    params: query
  })
}

//分页获取采购申请列表
export function getpage(query) {
  return request({
    url: '/api/purchase_request/get_all_by_page',
    method: 'get',
    params: query
  })
}

//修改采购申请状态
export function updateStatus(id, data) {
  return request({
    url: '/api/purchase_request/update_status/' + id,
    method: 'put',
    data: data
  })
}

