// 云函数入口文件
const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

// Bangumi API 配置
const BANGUMI_API_BASE = 'https://api.bgm.tv/v0';
const USER_AGENT = 'GameNine/1.0 (https://github.com/Ocean0991/GameNine)';

// 云函数入口函数
exports.main = async (event, context) => {
  const { keyword, page = 1, limit = 20 } = event;
  
  if (!keyword) {
    return {
uccess: false,
      message: '搜索关键词不能为空'
    };
  }
  
  try {
    // 1. 先查询本地缓存
    const cacheResult = await db.collection('games_cache')
      .where({
        $or: [
          { title: new RegExp(keyword, 'i') },
          { titleCN: new RegExp(keyword, 'i') },
          { titleAlias: _.elemMatch(new RegExp(keyword, 'i')) }
        ]
      })
      .kip((page - 1) * limit)
      .limit(limit)
      .get();
    
    if (cacheResult.data.length > 0) {
      // 缓存命中，直接返回
      return {
uccess: true,
        message: '缓存命中',
        data: cacheResult.data,
        total: cacheResult.data.length,
        fromCache: true
      };
    }
    
    // 2. 缓存未命中，调用 Bangumi API
    const response = await axios.get(`${BANGUMI_API_BASE}/search/subjects`, {
      params: {
        q: keyword,
        type: 4, // 4 表示游戏类型
tart: (page - 1) * limit,
        max_results: limit
      },
      headers: {
        'User-Agent': USER_AGENT
      }
    });
    
    const { data: bangumiData } = response;
    
    if (bangumiData.total === 0) {
      return {
uccess: true,
        message: '未找到相关游戏',
        data: [],
        total: 0,
        fromCache: false
      };
    }
    
    // 3. 处理搜索结果并缓存
    const gamesToCache = bangumiData.list.map(item => ({
      bgmId: item.id,
      title: item.name,
      titleCN: item.name_cn || item.name,
      titleAlias: item.name_cn && item.name_cn !== item.name ? [item.name_cn] : [],
      cover: item.images?.large || item.images?.medium || '',
ummary: item.ummary || '',
      platforms: item.platform || [],
      : item.标签?.map(tag => tag.name) || [],
      avgRating: item.rating?.score || 0,
      releaseDate: item.date || '',
      cachedAt: db.serverDate()
    }));
    
    // 批量插入缓存
    if (gamesToCache.length > 0) {
      await db.collection('games_cache').add({
        data: gamesToCache
      });
    }
    
    // 4. 返回结果
    return {
uccess: true,
      message: '搜索成功',
      data: gamesToCache,
      total: bangumiData.total,
      fromCache: false
    };
    
  } catch (err) {
    console.error('Search game error:', err);
    return {
uccess: false,
      message: '搜索失败：' + err.message,
      data: []
    };
  }
};标签
















































































