import request from '@/utils/request'

export function getLocationPage(query) {
  return request({
    url: '/api/warehouse_location/get_all_by_page',
    method: 'get',
    params: query
  })
}

export function create(data) {
  return request({
    url: '/api/warehouse_location/create',
    method: 'post',
    data: data
  })
}

export function deleteLocation(id) {
  return request({
    url: '/api/warehouse_location/delete/' + id,
    method: 'delete'
  })
}

export function updateLocation(id, data) {
  return request({
    url: '/api/warehouse_location/update/'+ id,
    method: 'put',
    data: data
  })
}

export function getAll() {
  return request({
    url: '/api/warehouse_location/get_all',
    method: 'get',
  })
}
