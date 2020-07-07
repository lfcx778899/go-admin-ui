import request from '@/utils/request'

//分页获取采购日志
export function getPage(query) {
  return request({
    url: '/api/purchase_request_log/get_all_by_page',
    method: 'get',
    params: query
  })
}
