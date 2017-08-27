import axios from 'axios'
export default {
  // APIモック
  fetchVideoList() {
    return axios.get('data.json')
  },
}