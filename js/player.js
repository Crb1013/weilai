// 音乐播放器核心功能
class MusicPlayer {
  constructor() {
    // 获取DOM元素
    this.audio = document.getElementById('audio-player');
    this.playBtn = document.getElementById('play-btn');
    this.prevBtn = document.getElementById('prev-btn');
    this.nextBtn = document.getElementById('next-btn');
    this.progressBar = document.getElementById('progress-bar');
    this.progressFill = document.getElementById('progress-fill');
    this.progressHandle = document.getElementById('progress-handle');
    this.currentTime = document.getElementById('current-time');
    this.totalTime = document.getElementById('total-time');
    this.volumeBtn = document.getElementById('volume-btn');
    this.volumeSlider = document.getElementById('volume-slider');
    this.trackList = document.getElementById('track-list');
    this.addFileBtn = document.getElementById('add-file-btn');
    this.fileInput = document.getElementById('file-input');
    this.clearPlaylistBtn = document.getElementById('clear-playlist-btn');
    this.nowPlayingTitle = document.getElementById('now-playing-title');
    this.nowPlayingArtist = document.getElementById('now-playing-artist');
    this.fullscreenBtn = document.getElementById('fullscreen-btn');
    this.lyricsBtn = document.getElementById('lyrics-btn');
    this.uploadLyricsBtn = document.getElementById('upload-lyrics-btn');
    this.lyricsInput = document.getElementById('lyrics-input');
    this.uploadArtBtn = document.getElementById('upload-art-btn');
    this.artInput = document.getElementById('art-input');
    this.playModeBtn = document.getElementById('play-mode-btn');
    this.exportPlaylistBtn = document.getElementById('export-playlist-btn');
    this.importPlaylistBtn = document.getElementById('import-playlist-btn');
    this.playlistInput = document.getElementById('playlist-input');
    this.lyricsContainer = document.querySelector('.lyrics-container');
    this.lyricsDisplay = document.getElementById('lyrics-display');
    this.trackImage = document.getElementById('track-image');
    this.albumArtDisplay = document.getElementById('album-art-display');
    
    // 状态变量 - 集中管理所有状态
    // 播放状态
    this.isPlaying = false;
    this.currentIndex = -1;
    this.isDragging = false;
    this.isFullscreen = false;
    this.lyricsVisible = true;
    
    // 数据存储
    this.playlist = [];
    this.lyricsData = []; // 存储歌词数据
    this.userLyrics = {}; // 存储用户上传的歌词
    this.userAlbumArt = {}; // 存储用户上传的专辑图片
    
    // 播放模式: 'normal' 正常播放, 'repeat' 单曲循环, 'repeat-all' 列表循环, 'shuffle' 随机播放
    this.playMode = 'normal';
    
    // 初始化
    this.init();
  }
  
  // 切换播放模式
  togglePlayMode() {
    const modes = ['normal', 'repeat', 'repeat-all', 'shuffle'];
    const currentIndex = modes.indexOf(this.playMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    this.playMode = modes[nextIndex];
    
    // 更新播放模式按钮图标
    switch(this.playMode) {
      case 'normal':
        this.playModeBtn.innerHTML = '▶';
        break;
      case 'repeat':
        this.playModeBtn.innerHTML = '🔂';
        break;
      case 'repeat-all':
        this.playModeBtn.innerHTML = '🔁';
        break;
      case 'shuffle':
        this.playModeBtn.innerHTML = '🔀';
        break;
    }
  }
  
  init() {
    // 设置音频元素事件监听
    this.audio.addEventListener('ended', () => {
      switch(this.playMode) {
        case 'repeat':
          // 单曲循环 - 重新加载当前曲目
          this.loadTrack(this.currentIndex);
          break;
        case 'shuffle':
          // 随机播放 - 随机选择一首不同的歌曲
          if (this.playlist.length > 1) {
            let newIndex;
            do {
              newIndex = Math.floor(Math.random() * this.playlist.length);
            } while (newIndex === this.currentIndex);
            this.currentIndex = newIndex;
          }
          this.loadTrack(this.currentIndex);
          break;
        case 'repeat-all':
          // 列表循环 - 播放下一首
          this.playNext();
          break;
        case 'normal':
        default:
          // 正常播放 - 如果不是最后一首就播放下一首
          if (this.currentIndex < this.playlist.length - 1) {
            this.playNext();
          } else {
            // 播放完最后一首后停止
            this.isPlaying = false;
            this.playBtn.innerHTML = '▶';
          }
          break;
      }
    });
    this.audio.addEventListener('timeupdate', () => this.updateProgress());
    this.audio.addEventListener('loadedmetadata', () => this.updateTotalTime());
    this.audio.addEventListener('error', (e) => this.handleAudioError(e));
    
    // 设置音量初始值
    this.audio.volume = 0.8;
    this.volumeSlider.value = this.audio.volume * 100;
    
    // 绑定控制按钮事件
    this.playBtn.addEventListener('click', () => this.togglePlay());
    this.prevBtn.addEventListener('click', () => this.playPrev());
    this.nextBtn.addEventListener('click', () => this.playNext());
    
    // 进度条事件
    this.progressBar.addEventListener('click', (e) => this.seek(e));
    this.progressBar.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.seek(e);
    });
    
    document.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        this.seek(e);
      }
    });
    
    document.addEventListener('mouseup', () => {
      this.isDragging = false;
    });
    
    // 音量控制事件
    this.volumeBtn.addEventListener('click', () => this.toggleMute());
    this.volumeSlider.addEventListener('input', () => this.setVolume());
    
    // 添加音乐文件事件
    this.addFileBtn.addEventListener('click', () => this.openFileDialog());
    this.fileInput.addEventListener('change', (e) => this.handleFileSelection(e));
    this.clearPlaylistBtn.addEventListener('click', () => this.clearPlaylist());
    
    // 全屏和歌词控制事件
    this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    this.lyricsBtn.addEventListener('click', () => this.toggleLyrics());
    this.uploadLyricsBtn.addEventListener('click', () => this.openLyricsDialog());
    this.lyricsInput.addEventListener('change', (e) => this.handleLyricsSelection(e));
    
    // 专辑图片上传和播放模式控制
    this.uploadArtBtn.addEventListener('click', () => this.openArtDialog());
    this.artInput.addEventListener('change', (e) => this.handleArtSelection(e));
    this.playModeBtn.addEventListener('click', () => this.togglePlayMode());
    
    // 播放列表导入导出控制
    this.exportPlaylistBtn.addEventListener('click', () => this.exportPlaylist());
    this.importPlaylistBtn.addEventListener('click', () => this.importPlaylistDialog());
    this.playlistInput.addEventListener('change', (e) => this.handlePlaylistImport(e));
    
    // 监听全屏变化事件
    document.addEventListener('fullscreenchange', () => this.updateFullscreenState());
    
    // 初始化基于时间的主题颜色
    this.initTimeBasedTheme();
    
    // 尝试从本地存储加载播放列表和用户数据
    this.loadPlaylist();
    this.loadUserLyrics();
    this.loadUserAlbumArt();
  }
  
  // 播放/暂停切换
  togglePlay() {
    if (this.playlist.length === 0) return;
    
    if (this.isPlaying) {
      this.audio.pause();
      this.playBtn.innerHTML = '▶';
    } else {
      this.audio.play();
      this.playBtn.innerHTML = '❚❚';
    }
    this.isPlaying = !this.isPlaying;
  }
  
  // 播放上一首
  playPrev() {
    if (this.playlist.length === 0) return;
    
    switch(this.playMode) {
      case 'repeat':
        // 单曲循环 - 重新加载当前曲目
        this.loadTrack(this.currentIndex);
        break;
      case 'shuffle':
        // 随机播放 - 随机选择一首不同的歌曲
        if (this.playlist.length > 1) {
          let newIndex;
          do {
            newIndex = Math.floor(Math.random() * this.playlist.length);
          } while (newIndex === this.currentIndex);
          this.currentIndex = newIndex;
        }
        this.loadTrack(this.currentIndex);
        break;
      case 'repeat-all':
      case 'normal':
      default:
        // 列表循环或正常播放
        this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
        this.loadTrack(this.currentIndex);
        break;
    }
  }
  
  // 播放下一首
  playNext() {
    if (this.playlist.length === 0) return;
    
    switch(this.playMode) {
      case 'repeat':
        // 单曲循环 - 重新加载当前曲目
        this.loadTrack(this.currentIndex);
        break;
      case 'shuffle':
        // 随机播放 - 随机选择一首不同的歌曲
        if (this.playlist.length > 1) {
          let newIndex;
          do {
            newIndex = Math.floor(Math.random() * this.playlist.length);
          } while (newIndex === this.currentIndex);
          this.currentIndex = newIndex;
        }
        this.loadTrack(this.currentIndex);
        break;
      case 'repeat-all':
      case 'normal':
      default:
        // 列表循环或正常播放
        this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
        this.loadTrack(this.currentIndex);
        break;
    }
  }
  
  // 加载并播放指定索引的音乐
  loadTrack(index) {
    if (index < 0 || index >= this.playlist.length) return;
    
    this.currentIndex = index;
    const track = this.playlist[index];
    
    // 设置音频源
    this.audio.src = track.path;
    
    // 更新当前播放信息
    this.nowPlayingTitle.textContent = track.title;
    this.nowPlayingArtist.textContent = track.artist || '未知艺术家';
    
    // 更新播放列表UI
    this.updatePlaylistUI();
    
    // 加载歌词
    this.loadLyrics(track.title);
    
    // 加载并显示歌曲图片
    this.loadTrackImage(track);
    
    // 播放音乐
    this.audio.play().then(() => {
      this.isPlaying = true;
      this.playBtn.innerHTML = '❚❚';
    }).catch(error => {
      console.error('播放失败:', error);
    });
  }
  
  // 更新进度条
  updateProgress() {
    const progress = (this.audio.currentTime / this.audio.duration) * 100;
    this.progressFill.style.width = `${progress}%`;
    this.progressHandle.style.left = `${progress}%`;
    
    // 更新当前时间显示
    this.currentTime.textContent = this.formatTime(this.audio.currentTime);
    
    // 更新当前歌词
    this.updateLyrics(this.audio.currentTime);
  }
  
  // 更新总时长
  updateTotalTime() {
    this.totalTime.textContent = this.formatTime(this.audio.duration);
  }
  
  // 跳转到指定位置
  seek(e) {
    const progressBarRect = this.progressBar.getBoundingClientRect();
    const seekTime = ((e.clientX - progressBarRect.left) / progressBarRect.width) * this.audio.duration;
    this.audio.currentTime = seekTime;
  }
  
  // 设置音量
  setVolume() {
    const volume = this.volumeSlider.value / 100;
    this.audio.volume = volume;
    this.updateVolumeIcon();
  }
  
  // 切换静音
  toggleMute() {
    this.audio.muted = !this.audio.muted;
    this.updateVolumeIcon();
    if (!this.audio.muted) {
      this.volumeSlider.value = this.audio.volume * 100;
    }
  }
  
  // 更新音量图标
  updateVolumeIcon() {
    if (this.audio.muted || this.audio.volume === 0) {
      this.volumeBtn.innerHTML = '🔇';
    } else if (this.audio.volume < 0.5) {
      this.volumeBtn.innerHTML = '🔈';
    } else {
      this.volumeBtn.innerHTML = '🔊';
    }
  }
  
  // 格式化时间
  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
  
  // 打开文件对话框
  openFileDialog() {
    this.fileInput.click();
  }
  
  // 打开歌词文件选择对话框
  openLyricsDialog() {
    if (this.currentIndex === -1) {
      alert('请先选择一首歌曲');
      return;
    }
    this.lyricsInput.click();
  }
  
  openArtDialog() {
    // 确保当前有正在播放的歌曲
    if (this.currentIndex !== -1 && this.playlist.length > 0) {
      this.artInput.click();
    } else {
      alert('请先播放一首歌曲再上传专辑图片');
    }
  }
  
  handleArtSelection(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('请上传JPG、PNG或GIF格式的图片');
      return;
    }
    
    // 读取图片文件
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageDataUrl = event.target.result;
      const currentTrack = this.playlist[this.currentIndex];
      const trackKey = currentTrack.title || currentTrack.name || '未知歌曲';
      
      // 保存到内存
      this.userAlbumArt[trackKey] = imageDataUrl;
      
      // 立即更新显示
      this.trackImage.src = imageDataUrl;
      
      // 保存到本地存储
      this.saveUserAlbumArt();
      
      alert('专辑图片上传成功！');
    };
    reader.readAsDataURL(file);
    
    // 清空文件输入，允许重复选择同一文件
    this.artInput.value = '';
  }
  
  saveUserAlbumArt() {
    try {
      localStorage.setItem('musicPlayer_userAlbumArt', JSON.stringify(this.userAlbumArt));
    } catch (error) {
      console.error('保存用户专辑图片失败:', error);
    }
  }
  
  loadUserAlbumArt() {
    try {
      const saved = localStorage.getItem('musicPlayer_userAlbumArt');
      if (saved) {
        this.userAlbumArt = JSON.parse(saved);
      }
    } catch (error) {
      console.error('加载用户专辑图片失败:', error);
    }
  }
  
  // 处理歌词文件选择
  handleLyricsSelection(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const lyricsFile = files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const lyricsContent = event.target.result;
      const track = this.playlist[this.currentIndex];
      
      // 解析歌词
      const parsedLyrics = this.parseLyricsFile(lyricsContent);
      
      // 存储用户上传的歌词
      this.userLyrics[track.title] = parsedLyrics;
      
      // 保存用户歌词到本地存储
      this.saveUserLyrics();
      
      // 立即加载新的歌词
      this.lyricsData = parsedLyrics;
      this.renderLyrics();
      
      alert(`歌词已成功上传并应用于「${track.title}」`);
    };
    
    reader.onerror = () => {
      alert('读取歌词文件失败');
    };
    
    reader.readAsText(lyricsFile, 'utf-8');
    
    // 清除input值，允许重新选择相同文件
    e.target.value = '';
  }
  
  // 解析歌词文件内容
  parseLyricsFile(content) {
    const lyrics = [];
    const lines = content.split('\n');
    
    // LRC歌词格式正则表达式
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;
    
    lines.forEach(line => {
      // 跳过空行和元信息行
      if (!line.trim() || line.startsWith('[ar:') || line.startsWith('[ti:') || 
          line.startsWith('[al:') || line.startsWith('[by:')) {
        return;
      }
      
      // 提取时间标签
      const timeTags = [];
      let match;
      while ((match = timeRegex.exec(line)) !== null) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        const milliseconds = parseInt(match[3]);
        const totalSeconds = minutes * 60 + seconds + milliseconds / 1000;
        timeTags.push(totalSeconds);
      }
      timeRegex.lastIndex = 0;
      
      // 提取歌词文本（去掉时间标签后的部分）
      const text = line.replace(/\[(\d{2}):(\d{2})\.(\d{2,3})\]/g, '').trim();
      
      // 为每个时间标签创建歌词行
      if (timeTags.length > 0 && text) {
        timeTags.forEach(time => {
          lyrics.push({ time, text });
        });
      }
    });
    
    // 按时间排序
    lyrics.sort((a, b) => a.time - b.time);
    
    return lyrics;
  }
  
  // 保存用户上传的歌词到本地存储
  saveUserLyrics() {
    try {
      localStorage.setItem('userLyrics', JSON.stringify(this.userLyrics));
    } catch (e) {
      console.error('保存用户歌词失败:', e);
    }
  }
  
  // 从本地存储加载用户上传的歌词
  loadUserLyrics() {
    try {
      const saved = localStorage.getItem('userLyrics');
      if (saved) {
        this.userLyrics = JSON.parse(saved);
      }
    } catch (e) {
      console.error('加载用户歌词失败:', e);
      this.userLyrics = {};
    }
  }
  
  // 处理文件选择
  handleFileSelection(e) {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // 过滤出音频文件
      const audioFiles = files.filter(file => file.type.includes('audio/'));
      
      // 检查是否有导入的播放列表元数据
      let importedPlaylist = null;
      try {
        const saved = localStorage.getItem('musicPlayerImportedPlaylist');
        if (saved) {
          importedPlaylist = JSON.parse(saved);
        }
      } catch (error) {
        console.error('加载导入的播放列表失败:', error);
      }
      
      // 添加文件，传入导入的播放列表用于匹配
      this.addTracks(audioFiles, importedPlaylist);
      
      // 如果成功匹配了导入的播放列表，可以清除临时存储
      if (importedPlaylist) {
        localStorage.removeItem('musicPlayerImportedPlaylist');
      }
      
      // 清除input值，允许重新选择相同文件
      e.target.value = '';
    }
  }
  
  // 添加音轨到播放列表
  addTracks(files, importedPlaylist = null) {
    if (!files || files.length === 0) return;
    
    let addedCount = 0;
    let matchedCount = 0;
    
    files.forEach(file => {
      // 创建文件URL
      const fileURL = URL.createObjectURL(file);
      
      // 检查是否已在播放列表中
      if (!this.playlist.some(track => track.path === fileURL)) {
        let trackInfo = this.parseTrackInfo(file);
        
        // 如果有导入的播放列表，尝试匹配元数据
        if (importedPlaylist && importedPlaylist.length > 0) {
          const matchedMetadata = this.findMatchingMetadata(file, importedPlaylist);
          if (matchedMetadata) {
            // 合并元数据
            trackInfo = {
              ...trackInfo,
              title: matchedMetadata.title || trackInfo.title,
              artist: matchedMetadata.artist || trackInfo.artist,
              album: matchedMetadata.album || trackInfo.album,
              year: matchedMetadata.year || trackInfo.year,
              genre: matchedMetadata.genre || trackInfo.genre
            };
            matchedCount++;
          }
        }
        
        // 提取专辑封面图片
        this.extractCoverImage(trackInfo);
        this.playlist.push(trackInfo);
        addedCount++;
      }
    });
    
    // 更新播放列表UI
    this.renderPlaylist();
    
    // 如果是第一次添加且没有当前播放的音乐，自动播放第一首
    if (this.currentIndex === -1 && this.playlist.length > 0) {
      this.loadTrack(0);
    }
    
    // 保存播放列表（注意：由于安全限制，只能保存元数据，不能保存文件路径）
    this.savePlaylist();
    
    // 如果有匹配的元数据，显示提示
    if (matchedCount > 0) {
      alert(`成功添加${addedCount}首歌曲，其中${matchedCount}首匹配了导入的元数据`);
    }
  }
  
  // 查找匹配的元数据
  findMatchingMetadata(file, importedPlaylist) {
    const fileName = file.name.toLowerCase();
    const baseFileName = this.getFileNameWithoutExtension(fileName);
    
    // 尝试匹配文件名（精确匹配或部分匹配）
    for (const metadata of importedPlaylist) {
      const metadataFileName = (metadata.fileName || '').toLowerCase();
      const metadataBaseName = this.getFileNameWithoutExtension(metadataFileName);
      
      // 精确匹配文件名
      if (fileName === metadataFileName) {
        return metadata;
      }
      
      // 部分匹配文件名（例如，路径不同但文件名相同）
      if (baseFileName === metadataBaseName) {
        return metadata;
      }
      
      // 尝试匹配歌曲标题和艺术家
      if (metadata.title && metadata.artist) {
        const trackTitle = (metadata.title || '').toLowerCase();
        const trackArtist = (metadata.artist || '').toLowerCase();
        
        // 如果文件名包含标题和艺术家的一部分，可能是匹配的
        if (baseFileName.includes(trackTitle) || baseFileName.includes(trackArtist)) {
          return metadata;
        }
      }
    }
    
    return null;
  }
  
  // 获取不带扩展名的文件名
  getFileNameWithoutExtension(fileName) {
    const lastDotIndex = fileName.lastIndexOf('.');
    return lastDotIndex > 0 ? fileName.substring(0, lastDotIndex).toLowerCase() : fileName.toLowerCase();
  }
  
  // 解析音轨信息
  parseTrackInfo(file) {
    const fileName = file.name;
    const fileExt = fileName.lastIndexOf('.') !== -1 ? fileName.slice(fileName.lastIndexOf('.')) : '';
    const nameWithoutExt = fileName.slice(0, -fileExt.length);
    
    // 尝试从文件名解析艺术家和标题
    // 格式: 艺术家 - 标题
    let artist = '未知艺术家';
    let title = nameWithoutExt;
    
    const match = nameWithoutExt.match(/(.+?)[-－](.+)/);
    if (match && match.length >= 3) {
      artist = match[1].trim();
      title = match[2].trim();
    }
    
    // 创建文件URL
    const fileURL = URL.createObjectURL(file);
    
    // 创建track对象
    const track = {
      path: fileURL,
      title: title,
      artist: artist,
      fileName: fileName,
      duration: 0, // 将在播放时获取
      file: file,  // 保存原始文件对象用于提取封面
      coverImage: null // 将在提取后更新
    };
    
    // 尝试提取专辑封面
    this.extractCoverImage(track);
    
    return track;
  }
  
  // 渲染播放列表
  renderPlaylist() {
    this.trackList.innerHTML = '';
    
    this.playlist.forEach((track, index) => {
      const trackItem = document.createElement('div');
      trackItem.className = `track-item ${index === this.currentIndex ? 'active' : ''}`;
      trackItem.dataset.index = index;
      
      trackItem.innerHTML = `
        <div class="track-number">${index + 1}</div>
        <div class="track-info">
          <div class="track-title">${track.title}</div>
          <div class="track-meta">${track.artist}</div>
        </div>
        <div class="track-duration">${track.duration ? this.formatTime(track.duration) : '--:--'}</div>
      `;
      
      trackItem.addEventListener('click', () => this.loadTrack(index));
      
      // 添加右键菜单支持
      trackItem.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this.showContextMenu(index, e.clientX, e.clientY);
      });
      
      this.trackList.appendChild(trackItem);
    });
  }
  
  // 更新播放列表UI（主要用于更新活动状态）
  updatePlaylistUI() {
    const trackItems = this.trackList.querySelectorAll('.track-item');
    trackItems.forEach((item, index) => {
      if (index === this.currentIndex) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }
  
  // 清空播放列表
  clearPlaylist() {
    if (confirm('确定要清空播放列表吗？')) {
      this.playlist = [];
      this.currentIndex = -1;
      this.audio.src = '';
      this.isPlaying = false;
      this.playBtn.innerHTML = '▶';
      this.nowPlayingTitle.textContent = '未播放';
      this.nowPlayingArtist.textContent = '添加音乐开始播放';
      this.renderPlaylist();
      
      // 清除本地存储
      localStorage.removeItem('musicPlayerPlaylist');
    }
  }
  
  // 显示右键菜单
  showContextMenu(index, x, y) {
    // 简单的右键菜单实现
    const menu = document.createElement('div');
    menu.style.position = 'fixed';
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.style.backgroundColor = '#252525';
    menu.style.borderRadius = '5px';
    menu.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.5)';
    menu.style.zIndex = '1000';
    menu.style.padding = '5px 0';
    
    const playOption = document.createElement('div');
    playOption.textContent = '播放';
    playOption.style.padding = '8px 20px';
    playOption.style.cursor = 'pointer';
    playOption.style.fontSize = '14px';
    playOption.addEventListener('mouseover', () => playOption.style.backgroundColor = 'rgba(255, 255, 255, 0.1)');
    playOption.addEventListener('mouseout', () => playOption.style.backgroundColor = 'transparent');
    playOption.addEventListener('click', () => {
      this.loadTrack(index);
      document.body.removeChild(menu);
    });
    
    const removeOption = document.createElement('div');
    removeOption.textContent = '从播放列表移除';
    removeOption.style.padding = '8px 20px';
    removeOption.style.cursor = 'pointer';
    removeOption.style.fontSize = '14px';
    removeOption.addEventListener('mouseover', () => removeOption.style.backgroundColor = 'rgba(255, 255, 255, 0.1)');
    removeOption.addEventListener('mouseout', () => removeOption.style.backgroundColor = 'transparent');
    removeOption.addEventListener('click', () => {
      this.removeTrack(index);
      document.body.removeChild(menu);
    });
    
    menu.appendChild(playOption);
    menu.appendChild(removeOption);
    document.body.appendChild(menu);
    
    // 点击其他地方关闭菜单
    setTimeout(() => {
      const closeMenu = () => {
        if (document.body.contains(menu)) {
          document.body.removeChild(menu);
        }
        document.removeEventListener('click', closeMenu);
      };
      document.addEventListener('click', closeMenu);
    }, 0);
  }
  
  // 从播放列表移除音轨
  removeTrack(index) {
    this.playlist.splice(index, 1);
    
    // 如果移除的是当前播放的音轨
    if (index === this.currentIndex) {
      if (this.playlist.length === 0) {
        this.currentIndex = -1;
        this.audio.src = '';
        this.isPlaying = false;
        this.playBtn.innerHTML = '▶';
        this.nowPlayingTitle.textContent = '未播放';
        this.nowPlayingArtist.textContent = '添加音乐开始播放';
      } else if (index === this.playlist.length) {
        // 如果移除的是最后一首，播放前一首
        this.loadTrack(index - 1);
      } else {
        // 否则播放同一索引的新音轨
        this.loadTrack(index);
      }
    } else if (index < this.currentIndex) {
      // 如果移除的是当前索引之前的音轨，需要调整当前索引
      this.currentIndex--;
    }
    
    this.renderPlaylist();
    this.savePlaylist();
  }
  
  // 保存播放列表到本地存储（注意：由于安全限制，只能保存元数据）
  savePlaylist() {
    try {
      // 保存不包含URL的元数据（URL会过期）
      const playlistMetadata = this.playlist.map(track => ({
        title: track.title,
        artist: track.artist,
        fileName: track.fileName,
        duration: track.duration
      }));
      localStorage.setItem('musicPlayerPlaylistMetadata', JSON.stringify(playlistMetadata));
    } catch (error) {
      console.error('保存播放列表失败:', error);
    }
  }
  
  // 从本地存储加载播放列表元数据
  loadPlaylist() {
    try {
      const savedMetadata = localStorage.getItem('musicPlayerPlaylistMetadata');
      if (savedMetadata) {
        // 只加载元数据，用户需要重新选择文件
        const playlistMetadata = JSON.parse(savedMetadata);
        console.log('上次播放的音乐列表:', playlistMetadata);
      }
    } catch (error) {
      console.error('加载播放列表失败:', error);
    }
  }
  
  // 导出播放列表
  exportPlaylist() {
    if (this.playlist.length === 0) {
      alert('播放列表为空，无法导出');
      return;
    }
    
    // 准备要导出的数据
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      playlist: this.playlist.map(track => ({
        title: track.title,
        artist: track.artist,
        fileName: track.fileName,
        duration: track.duration,
        album: track.album || '',
        year: track.year || '',
        genre: track.genre || ''
      }))
    };
    
    // 创建JSON字符串
    const jsonContent = JSON.stringify(exportData, null, 2);
    
    // 创建Blob并下载
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `播放列表_${new Date().toLocaleDateString('zh-CN')}.json`;
    document.body.appendChild(a);
    a.click();
    
    // 清理
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    alert(`成功导出${this.playlist.length}首歌曲的播放列表`);
  }
  
  // 打开导入播放列表对话框
  importPlaylistDialog() {
    this.playlistInput.click();
  }
  
  // 处理播放列表导入
  handlePlaylistImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // 验证文件类型
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      alert('请上传JSON格式的播放列表文件');
      return;
    }
    
    // 读取文件内容
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importData = JSON.parse(event.target.result);
        
        // 验证数据格式
        if (!importData.playlist || !Array.isArray(importData.playlist)) {
          throw new Error('无效的播放列表格式');
        }
        
        // 导入元数据
        const importedTracks = importData.playlist.map(track => ({
          title: track.title || '未知歌曲',
          artist: track.artist || '未知艺术家',
          fileName: track.fileName || '',
          duration: track.duration || 0,
          album: track.album || '',
          year: track.year || '',
          genre: track.genre || '',
          // 注意：URL需要用户重新选择文件
          url: null
        }));
        
        // 保存到本地存储
        try {
          localStorage.setItem('musicPlayerImportedPlaylist', JSON.stringify(importedTracks));
          alert(`成功导入${importedTracks.length}首歌曲的播放列表元数据\n请重新选择对应的音乐文件以恢复播放`);
          
          // 显示导入的播放列表
          this.showImportedPlaylist(importedTracks);
        } catch (error) {
          console.error('保存导入的播放列表失败:', error);
          alert('保存导入的播放列表失败');
        }
      } catch (error) {
        console.error('解析播放列表文件失败:', error);
        alert('解析播放列表文件失败：' + error.message);
      }
    };
    reader.readAsText(file);
    
    // 清空文件输入
    this.playlistInput.value = '';
  }
  
  // 显示导入的播放列表
  showImportedPlaylist(importedTracks) {
    // 显示导入的播放列表元数据
    const confirmMsg = `已导入以下${importedTracks.length}首歌曲的元数据:\n\n` + 
      importedTracks.slice(0, 10).map((track, index) => 
        `${index + 1}. ${track.title} - ${track.artist}`
      ).join('\n') + 
      (importedTracks.length > 10 ? '\n...等更多歌曲' : '');
    
    // 保存导入的播放列表到临时存储，以便后续匹配
    try {
      localStorage.setItem('musicPlayerImportedPlaylist', JSON.stringify(importedTracks));
      console.log('导入的播放列表已保存，等待文件匹配...');
    } catch (error) {
      console.error('保存导入的播放列表失败:', error);
      alert('保存播放列表数据失败，请重试');
    }
    
    if (confirm(confirmMsg + '\n\n是否现在添加音乐文件？')) {
      this.openFileDialog();
    }
  }
  
  // 处理音频错误
  handleAudioError(e) {
    console.error('音频播放错误:', e);
    alert('无法播放当前音频文件。可能是格式不支持或文件损坏。');
    this.playNext();
  }
  
  // 全屏控制方法
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`全屏请求错误: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }
  
  // 更新全屏状态
  updateFullscreenState() {
    this.isFullscreen = !!document.fullscreenElement;
    
    if (this.isFullscreen) {
      document.body.classList.add('fullscreen');
      this.fullscreenBtn.innerHTML = '⛉'; // 退出全屏图标
    } else {
      document.body.classList.remove('fullscreen');
      this.fullscreenBtn.innerHTML = '⛶'; // 进入全屏图标
    }
  }
  
  // 切换歌词显示
  toggleLyrics() {
    this.lyricsVisible = !this.lyricsVisible;
    
    if (this.lyricsVisible) {
      this.lyricsContainer.classList.remove('hidden');
      this.lyricsBtn.innerHTML = '📝'; // 显示歌词图标
    } else {
      this.lyricsContainer.classList.add('hidden');
      this.lyricsBtn.innerHTML = '📋'; // 隐藏歌词图标
    }
  }
  
  // 加载歌词
  loadLyrics(trackTitle) {
    // 优先使用用户上传的歌词
    if (this.userLyrics && this.userLyrics[trackTitle]) {
      this.lyricsData = this.userLyrics[trackTitle];
    } else {
      // 模拟歌词数据（默认歌词）
      const mockLyrics = {
        '示例歌曲1': [
          { time: 0, text: '这是第一句歌词' },
          { time: 3, text: '音乐播放器正在播放' },
          { time: 6, text: '未来音乐，畅享无限' },
          { time: 9, text: '希望你喜欢这个播放器' },
          { time: 12, text: '感谢使用' }
        ],
        '示例歌曲2': [
          { time: 0, text: '第二首歌的歌词' },
          { time: 2, text: '旋律在耳边响起' },
          { time: 4, text: '沉浸在音乐的世界' },
          { time: 6, text: '享受美好时光' }
        ]
      };
      
      // 使用歌曲标题查找歌词，如果没有找到则使用默认歌词
      this.lyricsData = mockLyrics[trackTitle] || [];
    }
    
    this.renderLyrics();
  }
  
  // 渲染歌词
  renderLyrics() {
    if (this.lyricsData.length === 0) {
      this.lyricsDisplay.innerHTML = '<p class="lyrics-placeholder">暂无歌词</p>';
      return;
    }
    
    this.lyricsDisplay.innerHTML = '';
    
    this.lyricsData.forEach(line => {
      const p = document.createElement('p');
      p.className = 'lyrics-line';
      p.textContent = line.text;
      p.dataset.time = line.time;
      this.lyricsDisplay.appendChild(p);
    });
  }
  
  // 更新当前歌词
  updateLyrics(currentTime) {
    if (this.lyricsData.length === 0) return;
    
    // 找到当前应该高亮的歌词行
    let activeIndex = -1;
    for (let i = 0; i < this.lyricsData.length; i++) {
      if (currentTime >= this.lyricsData[i].time) {
        activeIndex = i;
      } else {
        break;
      }
    }
    
    // 更新歌词高亮状态
    const lyricLines = this.lyricsDisplay.querySelectorAll('.lyrics-line');
    lyricLines.forEach((line, index) => {
      if (index === activeIndex) {
        line.classList.add('active');
        // 滚动到当前歌词
        line.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        line.classList.remove('active');
      }
    });
  }
  
  // 初始化基于时间的主题颜色
  initTimeBasedTheme() {
    // 立即应用一次主题
    this.updateThemeBasedOnTime();
    
    // 每分钟更新一次主题
    setInterval(() => {
      this.updateThemeBasedOnTime();
    }, 60000);
  }
  
  // 基于当前时间更新主题颜色
  updateThemeBasedOnTime() {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // 根据时间计算主题颜色
    let primaryColor, secondaryColor, bgColor, cardBgColor;
    
    if (hour >= 6 && hour < 12) {
      // 早晨：清新的蓝色调
      primaryColor = '#4A90E2';
      secondaryColor = '#5BA3E8';
      bgColor = '#1A2B4A';
      cardBgColor = '#2A3B5A';
    } else if (hour >= 12 && hour < 18) {
      // 下午：温暖的橙色调
      primaryColor = '#FF8C00';
      secondaryColor = '#FFA500';
      bgColor = '#2A1A1A';
      cardBgColor = '#3A2A2A';
    } else if (hour >= 18 && hour < 22) {
      // 晚上：浪漫的紫色调
      primaryColor = '#9370DB';
      secondaryColor = '#8A2BE2';
      bgColor = '#1A1A2A';
      cardBgColor = '#2A2A3A';
    } else {
      // 深夜：深蓝色调
      primaryColor = '#1E3A8A';
      secondaryColor = '#1E40AF';
      bgColor = '#0F172A';
      cardBgColor = '#1E293B';
    }
    
    // 更新CSS变量
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.style.setProperty('--secondary-color', secondaryColor);
    document.documentElement.style.setProperty('--bg-color', bgColor);
    document.documentElement.style.setProperty('--card-bg-color', cardBgColor);
    
    // 更新元素样式
    document.body.style.backgroundColor = bgColor;
    document.querySelector('.title-bar').style.backgroundColor = cardBgColor;
    document.querySelector('.now-playing').style.backgroundColor = cardBgColor;
    document.querySelector('.player-controls').style.backgroundColor = cardBgColor;
    document.querySelector('.playlist-header').style.backgroundColor = cardBgColor;
    
    if (document.querySelector('.lyrics-container')) {
      document.querySelector('.lyrics-container').style.backgroundColor = `${cardBgColor}CC`;
      document.querySelector('.lyrics-container').style.borderColor = `${primaryColor}66`;
    }
    
    // 更新歌曲图片显示区域背景
    if (this.albumArtDisplay) {
      this.albumArtDisplay.style.backgroundColor = `${cardBgColor}88`;
    }
    
    // 更新播放按钮和进度条颜色
    const playBtn = document.querySelector('.play-btn');
    playBtn.style.background = `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`;
    
    const progressFill = document.getElementById('progress-fill');
    progressFill.style.background = `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`;
    
    // 更新当前活跃歌词的颜色
    const activeLyric = document.querySelector('.lyrics-line.active');
    if (activeLyric) {
      activeLyric.style.color = primaryColor;
    }
  }
  
  // 从音频文件中提取专辑封面
  extractCoverImage(track) {
    if (!track.file) return;
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      const dataView = new DataView(arrayBuffer);
      let offset = 0;
      
      // 简单的ID3v2.3/2.4标签解析
      if (dataView.getUint8(0) === 73 && dataView.getUint8(1) === 68 && dataView.getUint8(2) === 51) {
        // ID3v2标签
        const version = dataView.getUint8(3);
        const flags = dataView.getUint8(4);
        let tagSize = 0;
        
        // 计算标签大小
        for (let i = 0; i < 4; i++) {
          tagSize = (tagSize << 7) | (dataView.getUint8(5 + i) & 0x7F);
        }
        
        offset = 10; // ID3v2头大小
        
        // 查找APIC帧
        while (offset < tagSize + 10) {
          // 检查是否是APIC帧
          if (dataView.getUint8(offset) === 65 && 
              dataView.getUint8(offset + 1) === 80 && 
              dataView.getUint8(offset + 2) === 73 && 
              dataView.getUint8(offset + 3) === 67) {
            
            // 获取帧大小
            const frameSize = dataView.getUint32(offset + 4);
            
            // 帧标志
            const frameFlags = dataView.getUint16(offset + 8);
            
            // 获取图片数据
            let imageOffset = offset + 10;
            
            // 跳过MIME类型
            while (imageOffset < tagSize + 10 && dataView.getUint8(imageOffset) !== 0) {
              imageOffset++;
            }
            imageOffset++;
            
            // 跳过图片类型
            imageOffset++;
            
            // 跳过描述
            while (imageOffset < tagSize + 10 && dataView.getUint8(imageOffset) !== 0) {
              imageOffset++;
            }
            imageOffset++;
            
            // 创建图片数据的blob
            const imageData = new Uint8Array(arrayBuffer, imageOffset, frameSize - (imageOffset - offset - 10));
            const blob = new Blob([imageData], { type: 'image/jpeg' });
            const imageUrl = URL.createObjectURL(blob);
            
            // 保存到track对象
            track.coverImage = imageUrl;
            
            // 如果当前正在播放的是这首歌曲，立即更新显示
            if (this.currentIndex !== -1 && this.playlist[this.currentIndex] && this.playlist[this.currentIndex].path === track.path) {
              this.loadTrackImage(track);
            }
            
            break;
          }
          
          // 获取下一帧
          const frameSize = dataView.getUint32(offset + 4);
          offset += 10 + frameSize;
        }
      }
    };
    
    reader.onerror = (error) => {
      console.error('读取音频文件失败:', error);
    };
    
    reader.readAsArrayBuffer(track.file.slice(0, 1000000)); // 只读取文件前1MB以提高性能
  }
  
  // 加载并显示歌曲图片
  loadTrackImage(track) {
    if (!this.trackImage) return;
    
    this.trackImage.classList.remove('loaded');
    
    // 首先检查是否有用户上传的专辑图片
    const trackKey = track.title || track.name || '未知歌曲';
    if (this.userAlbumArt && this.userAlbumArt[trackKey]) {
      this.trackImage.src = this.userAlbumArt[trackKey];
      this.trackImage.onload = () => {
        this.trackImage.classList.add('loaded');
      };
      return;
    }
    
    // 检查track是否已有封面图片
    if (track.coverImage) {
      this.trackImage.src = track.coverImage;
      this.trackImage.onload = () => {
        this.trackImage.classList.add('loaded');
      };
      return;
    }
    
    // 尝试从音频文件中提取封面图片
    this.extractCoverImage(track);
    
    // 同时生成默认图片，以防提取失败
    setTimeout(() => {
      if (!this.trackImage.src || this.trackImage.src === '') {
        this.generateDefaultImage(track);
      }
    }, 1000);
  }
  
  // 生成默认图片
  generateDefaultImage(track) {
    if (!this.trackImage) return;
    
    // 创建一个canvas元素来生成默认图片
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    // 基于歌曲标题生成一个简单的图案
    const title = track ? track.title || '未知歌曲' : '未知歌曲';
    let color = '#';
    
    // 使用标题文本生成一个简单的颜色
    for (let i = 0; i < 6; i++) {
      const charCode = title.charCodeAt(i % title.length);
      color += (charCode % 16).toString(16);
    }
    
    // 绘制背景
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制文本
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = 'bold 30px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 绘制歌曲标题的首字母
    const initial = title.charAt(0).toUpperCase();
    ctx.fillText(initial, canvas.width / 2, canvas.height / 2);
    
    // 将canvas转换为data URL并设置为图片源
    const dataUrl = canvas.toDataURL('image/png');
    this.trackImage.src = dataUrl;
    this.trackImage.onload = () => {
      this.trackImage.classList.add('loaded');
    };
  }
}

// 当DOM加载完成后初始化播放器
document.addEventListener('DOMContentLoaded', () => {
  const player = new MusicPlayer();
  window.player = player; // 暴露到全局，方便调试
});