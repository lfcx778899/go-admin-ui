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
