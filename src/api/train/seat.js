import request from '@/utils/request'

// 查询座位列表
export function listSeat(query) {
  return request({
    url: '/train/seat/list',
    method: 'get',
    params: query
  })
}

// 查询座位详细
export function getSeat(id) {
  return request({
    url: '/train/seat/' + id,
    method: 'get'
  })
}

// 新增座位
export function addSeat(data) {
  return request({
    url: '/train/seat',
    method: 'post',
    data: data
  })
}

// 修改座位
export function updateSeat(data) {
  return request({
    url: '/train/seat',
    method: 'put',
    data: data
  })
}

// 删除座位
export function delSeat(id) {
  return request({
    url: '/train/seat/' + id,
    method: 'delete'
  })
}
