<template>
  <div id="app">
    <header>
      <h1 class="title">走行パートだけプレイヤー(試作品)</h1>
    </header>
    <main>
      <aside>
        <ul v-for="(video, index) in videoList">
          <li class="clickable play-list" @click="videoSelect(index)">
            <span v-bind:class="{playing: index === selectedVideoIndex}">{{video.title}}</span>
          </li>
        </ul>
      </aside>
      <section>
        <div id="player"></div>
        <div id="controll">
          <div class="description">
            <div v-if="selectedVideoIndex >= 0">
              <strong class="caption">
                <span>{{selectedVideoTitle}}</span>
                <span @click="videoPlay" class="clickable"><i class="fa fa-play-circle" aria-hidden="true"></i>再生する</span>
              </strong>
              <hr>
              <div>
                <strong class="caption">長さ</strong>
                <span class="data">{{selectedVideoDuation}}</span>
              </div>
              <div>
                <strong class="caption">路線</strong>
                <span class="data">{{selectedVideoInfoLine}}</span>
              </div>
              <div>
                <strong class="caption">種別</strong>
                <span class="data">{{selectedVideoInfoCategory}}</span>
              </div>
              <div>
                <strong class="caption">車両</strong>
                <span class="data">{{selectedVideoInfoTrain}}</span>
              </div>
              <div>
                <strong class="caption">区間</strong>
                <span class="data">{{selectedVideoInfoSection}}</span>
              </div>
              <div>
                <strong class="caption">解説</strong>
                <span class="data">{{selectedVideoInfoMessage}}</span>
              </div>
            </div>
          </div>
          <div class="prev btn-player clickable" @click="videoPrev"><i class="fa fa-chevron-left" aria-hidden="true"></i></div>
          <div class="next btn-player clickable" @click="videoNext"><i class="fa fa-chevron-right" aria-hidden="true"></i></div>
        </div>
      </section>
    </main>
    <footer>
      copyright 2017 <a href="https://twitter.com/128Na">@128Na</a>
    </footer>
  </div>
</template>

<script>
import YouTubePlayer from 'youtube-player'
import api from './api'
export default {
  name: 'app',
  data () {
    return {
      player: null,         // ようつべPlayerインスタンス
      videoList: [],        // 動画リストAPIからとってきて。どうぞ
      selectedVideoIndex: -1,  // 再生中動画
    }
  },
  mounted() {
    Promise.resolve()
      .then(api.fetchVideoList)
      .then(this.treatData)
      .then(this.onYouTubeIframeAPIReady)
  },
  methods: {
    // 算出可能なプロパティを計算する
    treatData(res) {
      this.videoList = res.data.map(d => {
        // 再生時間(mm:ss)
        const duation    = d.end - d.start
        const duationMin = this.pad(parseInt(duation / 60, 10), 2, '0')
        const duationSec = this.pad(duation % 60, 2, '0')
        d.duation = `${duationMin}:${duationSec}`
        return d
      })
    },
    // ゼロ詰め
    pad(number, length, pad = '0') {
      return (Array(length).join(pad) + number).slice(-length);
    },
    // プレイヤーインスタンスの生成
    onYouTubeIframeAPIReady() {
      this.player = YouTubePlayer('player', {
        origin: 'http://localhost:8080',
        autoplay: 0,
      })
    },
    // 再生する動画を選択して再生する
    videoSelect(index) {
      this.selectedVideoIndex = index
    },
    videoPrev() {
      if (this.selectedVideoIndex > 0) {
        this.videoSelect(this.selectedVideoIndex - 1)
      }
    },
    videoNext() {
      if (this.selectedVideoIndex < this.videoList.length - 1) {
        this.videoSelect(this.selectedVideoIndex + 1)
      }
    },
    videoPlay() {
      const video = this.getSelectedVideo()
      const query = {
        videoId: video.id,
        startSeconds: video.start,
        endSeconds: video.end,
      }
      this.player.loadVideoById(query)
    },
    getSelectedVideo() {
      return this.videoList[this.selectedVideoIndex]
    },
  },
  computed: {
    selectedVideoDuation() {
      return this.getSelectedVideo().duation
    },
    selectedVideoTitle() {
      return this.getSelectedVideo().title
    },
    selectedVideoInfoLine() {
      return this.getSelectedVideo().desc.line
    },
    selectedVideoInfoCategory() {
      return this.getSelectedVideo().desc.category
    },
    selectedVideoInfoTrain() {
      return this.getSelectedVideo().desc.train
    },
    selectedVideoInfoSection() {
      return this.getSelectedVideo().desc.section
    },
    selectedVideoInfoMessage() {
      return this.getSelectedVideo().desc.message
    },
  }
}
</script>

<style>
/* general */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-size: 16px;
}
li {
  list-style: none;
}
.clickable {
  cursor: pointer;
}
.clickable:hover {
  color: rgba(0,0,0,.75);
}
small {
  color: #999;
}
a {
  color: #fff;
}


/* special */
body {
  height: 100vh;
}
#app {
  display: flex;
  flex-direction: column;
  height: 100%;
}
header {
  text-align: center;
}
main {
  flex: 1;
  overflow: hidden;

  display: flex;
}
  aside {
    width: 64px;
    overflow-y: scroll;
  }
    .play-list {
      margin: 4px 8px;
    }
    .playing {
      background-color: #ccc;
    }
  section {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
    #player {
      width: 100%;
      flex: 1;
    }
    #controll {
      height: 256px;
      display: flex;
      position: relative;
    }
      .btn-player {
        width: 17px;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        background-color: #fff; 
        position: absolute;
        text-align: center;
      }
      .btn-player:hover {
        background-color: #ccc;
      }
      .prev {
        top: 0;
        left:0;
        border-right: solid 1px #ddd;
      }
      .next {
        top: 0;
        right:0;
        border-left: solid 1px #ddd;
      }
      .description {
        padding: 8px 17px;
        width: 100%;
        overflow-y: scroll;
      }
        .caption,
        .data {
          padding:4px;
        }

footer {
  text-align: center;
}

header,
footer {
  background-color: #2e3192;
  color: #fff;
}
</style>
