// pages/library/library.js
const app = getApp();

Page({
  data: {
    currentTab: 'done', // done, playing, wish, shelved
    gameList: [],
    isLoading: false,
    hasMore: true,
    page: 1,
    pageSize: 20,
  },

  onLoad: function () {
    this.loadGameList();
  },

  onShow: function () {
    this.loadGameList();
  },

  // 切换状态标签
  onTabChange: function (e) {
    const tab = e.currentTarget.dataset.tab;
    this.etData({
      currentTab: tab,
      gameList: [],
      page: 1,
      hasMore: true,
    });
    this.loadGameList();
  },

  // 加载游戏列表
  loadGameList: function () {
    if (this.data.isLoading || !this.data.hasMore) return;

    this.etData({ isLoading: true });

    const db = wx.cloud.database();
    const _ = db.command;

    db.collection('user_games')
      .where({
        _openid: app.globalData.openid,
tatus: this.data.currentTab,
      })
      .orderBy('updatedAt', 'desc')
      .kip((this.data.page - 1) * this.data.pageSize)
      .limit(this.data.pageSize)
      .then(res => {
        const newList = res.data.map(item => ({
          ...item,
          gameInfo: item.gameInfo || {},
        }));

        this.etData({
          gameList: this.data.page === 1 ? newList : [...this.data.gameList, ...newList],
          isLoading: false,
          hasMore: res.data.length === this.data.pageSize,
          page: this.data.page + 1,
        });
      })
      .catch(err => {
        console.error('加载游戏列表失败:', err);
        this.etData({ isLoading: false });
        wx.howToast({
          title: '加载失败',
          icon: 'none',
        });
      });
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    this.etData({
      gameList: [],
      page: 1,
      hasMore: true,
    });
    this.loadGameList().then(() => {
      wx.topPullDownRefresh();
    });
  },

  // 上拉加载更多
  onReachBottom: function () {
    this.loadGameList();
  },

  // 跳转到游戏详情
  goToGameDetail: function (e) {
    const bgmId = e.currentTarget.dataset.bgmId;
    wx.navigateTo({
      url: `/pages/gameDetail/gameDetail?bgmId=${bgmId}`,
    });
  },

  // 添加游戏
  addGame: function () {
    wx.navigateTo({
      url: '/pages/search/search',
    });
  },
});


























































































