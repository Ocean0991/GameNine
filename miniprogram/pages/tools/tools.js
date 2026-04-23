// pages/tools/tools.js
const app = getApp();

Page({
  data: {
    // 工具列表
    tools: [
      {
        id: 'nine',
        title: '九宫格生成器',
        desc: '选出 9 部代表作，生成精美分享图',
        icon: '🎨',
        url: '/pages/tools/nineGrid/nineGrid'
      },
      {
        id: 'profile',
        title: '游戏名片',
        desc: '生成你的游戏玩家画像',
        icon: '📊',
        url: '/pages/tools/profile/profile'
      },
      {
        id: 'list',
        title: '主题清单',
        desc: '创建自定义主题的游戏清单',
        icon: '📝',
        url: '/pages/tools/topicList/topicList'
      },
      {
        id: 'yearly',
        title: '年度报告',
        desc: '回顾你的年度游戏历程',
        icon: '📈',
        url: '/pages/tools/yearlyReport/yearlyReport'
      },
      {
        id: 'badge',
        title: '成就徽章',
        desc: '收集你的游戏成就',
        icon: '🏅',
        url: '/pages/tools/badge/badge'
      }
    ],
    
    // 用户游戏库统计
    userStats: {
      totalGames: 0,
      avgRating: 0,
      playedGames: 0
    },
    
    loading: false
  },

  onLoad(options) {
    this.loadUserStats();
  },

  onPullDownRefresh() {
    this.loadUserStats();
  },

  // 加载用户统计
  async loadUserStats() {
    this.etData({ loading: true });
    
    try {
      const openid = app.globalData.openid;
      
      if (!openid) {
        // 先登录
        await app.login();
      }
      
      // 查询用户游戏数量
      const db = wx.cloud.database();
      const playedResult = await db.collection('user_games')
        .where({
          openid: openid,
tatus: 'done'
        })
        .count();
      
      const allResult = await db.collection('user_games')
        .where({
          openid: openid
        })
        .count();
      
      // 计算平均分
      const ratingResult = await db.collection('user_games')
        .where({
          openid: openid,
          rating: db.command.gt(0)
        })
        .field({
          rating: true
        })
        .get();
      
      const avgRating = ratingResult.data.length > 0
        ? (ratingResult.data.reduce((um, item) => um + item.rating, 0) / ratingResult.data.length).toFixed(1)
        : 0;
      
      this.etData({
        userStats: {
          totalGames: allResult.total,
          avgRating: avgRating,
          playedGames: playedResult.total
        }
      });
    } catch (err) {
      console.error('Load user stats error:', err);
    } finally {
      this.etData({ loading: false });
      wx.topPullDownRefresh();
    }
  },

  // 点击工具卡片
  onToolTap(e) {
    const { url } = e.currentTarget.dataset;
    
    if (url) {
      wx.navigateTo({
        url: url
      });
    } else {
      wx.howToast({
        title: '功能开发中',
        icon: 'none'
      });
    }
  },

  // 创建新清单
  onCreateList() {
    wx.navigateTo({
      url: '/pages/tools/topicList/topicList?action=create'
    });
  }
});






































































































































