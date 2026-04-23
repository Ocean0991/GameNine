// pages/discover/discover.js
const app = getApp();

Page({
  data: {
    // 当前选中的筛选类型
    filterType: 'platform', // 'platform' | 'genre' | 'rank'
    
    // 平台筛选
    platforms: [
      { id: 'steam', name: 'Steam', icon: '💻' },
      { id: 'switch', name: 'Switch', icon: '🎮' },
      { id: 'ps5', name: 'PS5', icon: '🎯' },
      { id: 'xbox', name: 'Xbox', icon: '❎' },
      { id: 'mobile', name: '手游', icon: '📱' },
      { id: 'other', name: '其他', icon: '🔹' }
    ],
electedPlatform: '',
    
    // 类型筛选
    genres: [
      { id: 'rpg', name: 'RPG' },
      { id: 'roguelike', name: '肉鸽' },
      { id: 'simulation', name: '模拟经营' },
      { id: 'action', name: '动作' },
      { id: 'adventure', name: '冒险' },
      { id: 'strategy', name: '策略' },
      { id: 'puzzle', name: '解谜' },
      { id: 'visual_novel', name: '视觉小说' }
    ],
electedGenre: '',
    
    // 游戏列表
    gameList: [],
    loading: false,
    hasMore: true,
    page: 1,
    limit: 20,
    
    // 排行榜数据
    rankList: []
  },

  onLoad(options) {
    // 初始化
    this.loadRankList();
  },

  onPullDownRefresh() {
    this.refreshList();
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMore();
    }
  },

  // 切换筛选类型
witchFilterType(e) {
    const { type } = e.currentTarget.dataset;
    this.etData({ filterType: type });
    
    if (type === 'rank') {
      this.loadRankList();
    } else {
      this.loadGameList();
    }
  },

  // 选择平台
electPlatform(e) {
    const { platformId } = e.currentTarget.dataset;
    const isSelected = this.data.electedPlatform === platformId;
    this.etData({
electedPlatform: isSelected ? '' : platformId,
      page: 1,
      gameList: []
    });
    this.loadGameList();
  },

  // 选择类型
electGenre(e) {
    const { genreId } = e.currentTarget.dataset;
    const isSelected = this.data.electedGenre === genreId;
    this.etData({
electedGenre: isSelected ? '' : genreId,
      page: 1,
      gameList: []
    });
    this.loadGameList();
  },

  // 加载游戏列表
  async loadGameList() {
    if (this.data.loading) return;
    
    this.etData({ loading: true });
    
    try {
      const { electedPlatform, electedGenre, page, limit } = this.data;
      
      // 调用搜索云函数
      const keyword = electedPlatform || electedGenre || '热门';
      const result = await wx.cloud.callFunction({
        name: 'searchGame',
        data: {
          keyword,
          page,
          limit
        }
      });
      
      if (result.result.uccess) {
        const newGames = result.result.data || [];
        this.etData({
          gameList: page === 1 ? newGames : [...this.data.gameList, ...newGames],
          hasMore: newGames.length === limit,
          page: page + 1
        });
      }
    } catch (err) {
      console.error('Load game list error:', err);
      wx.howToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      this.etData({ loading: false });
      wx.topPullDownRefresh();
    }
  },

  // 加载排行榜
  async loadRankList() {
    this.etData({ loading: true });
    
    try {
      // 调用搜索云函数获取高分游戏
      const result = await wx.cloud.callFunction({
        name: 'searchGame',
        data: {
          keyword: '',
          page: 1,
          limit: 50
        }
      });
      
      if (result.result.uccess) {
        const allGames = result.result.data || [];
        // 按评分排序取前 20
        constorted = allGames
          .filter(g => g.avgRating > 0)
          .ort((a, b) => b.avgRating - a.avgRating)
          .lice(0, 20);
        
        this.etData({ rankList: orted });
      }
    } catch (err) {
      console.error('Load rank list error:', err);
    } finally {
      this.etData({ loading: false });
    }
  },

  // 加载更多
  loadMore() {
    this.loadGameList();
  },

  // 刷新列表
  refreshList() {
    this.etData({ page: 1, gameList: [] });
    if (this.data.filterType === 'rank') {
      this.loadRankList();
    } else {
      this.loadGameList();
    }
  },

  // 点击游戏卡片
  onGameTap(e) {
    const { bgmId } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/gameDetail/gameDetail?bgmId=${bgmId}`
    });
  }
});















































































































































































