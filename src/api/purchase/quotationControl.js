import request from '@/utils/request'

//分页获取询价单列表
export function getQuotationControlPage(query) {
  return request({
    url: '/api/quotation_control/get_all_by_page',
    method: 'get',
    params: query
  })
}

//新建询价单
export function createQuotationControl(data) {
  return request({
    url: '/api/quotation_control/create',
    method: 'post',
    data: data
  })
}

//全部询价
export function createAll(data) {
  return request({
    url: '/api/quotation_control/create_all',
    method: 'post',
    data: data
  })
}

//修改询价单
export function updateQuotationControlItem(id, data) {
  return request({
    url: '/api/quotation_control/update/'+ id,
    method: 'put',
    data: data
  })
}

