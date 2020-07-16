import request from '@/utils/request'

//新建采购单
export function createPurchaseControl(data) {
  return request({
    url: '/api/purchase_control/create',
    method: 'post',
    data: data
  })
}

//分页获取采购单列表
export function getPurchaseControlPage(query) {
  return request({
    url: '/api/purchase_control/get_all_by_page',
    method: 'get',
    params: query
  })
}

//获取采购单详情
export function getPurchaseControlItem(query) {
  return request({
    url: '/api/purchase_control/get',
    method: 'get',
    params: query
  })
}

export function getPurchaseControlProduct(query) {
  return request({
    url: '/api/purchase_control_product_detail/get_all_by_page',
    method: 'get',
    params: query
  })
}

export function uploadContract(id,data) {
  return request({
    url: '/api/purchase_control/upload/'+id,
    method: 'post',
    data: data
  })
}
