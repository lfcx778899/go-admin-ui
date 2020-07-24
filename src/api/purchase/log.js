import request from '@/utils/request'

//分页获取采购日志
export function getPage(query) {
  return request({
    url: '/api/purchase_request_log/get_all_by_page',
    method: 'get',
    params: query
  })
}

//分页获取入库明细列表
export function getInLogPage(query) {
  return request({
    url: '/api/inventory_control_log/in_get_all_by_page',
    method: 'get',
    params: query
  })
}
