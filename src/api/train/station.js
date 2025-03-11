import request from '@/utils/request'

// 查询车站列表
export function listStation(query) {
  return request({
    url: '/train/station/list',
    method: 'get',
    params: query
  })
}

// 查询车站详细
export function getStation(id) {
  return request({
    url: '/train/station/' + id,
    method: 'get'
  })
}

// 新增车站
export function addStation(data) {
  return request({
    url: '/train/station',
    method: 'post',
    data: data
  })
}

// 修改车站
export function updateStation(data) {
  return request({
    url: '/train/station',
    method: 'put',
    data: data
  })
}

// 删除车站
export function delStation(id) {
  return request({
    url: '/train/station/' + id,
    method: 'delete'
  })
}
