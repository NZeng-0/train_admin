import request from '@/utils/request'

// 查询列车列表
export function listTrain(query) {
  return request({
    url: '/train/train/list',
    method: 'get',
    params: query
  })
}

// 查询列车详细
export function getTrain(id) {
  return request({
    url: '/train/train/' + id,
    method: 'get'
  })
}

// 新增列车
export function addTrain(data) {
  return request({
    url: '/train/train',
    method: 'post',
    data: data
  })
}

// 修改列车
export function updateTrain(data) {
  return request({
    url: '/train/train',
    method: 'put',
    data: data
  })
}

// 删除列车
export function delTrain(id) {
  return request({
    url: '/train/train/' + id,
    method: 'delete'
  })
}
