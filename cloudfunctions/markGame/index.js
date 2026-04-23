// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { OPENID } = wxContext;
  
  const {
    bgmId,
tatus,
    rating,
    comment,
    platform,
    playTime,
tartDate,
    finishDate,
    isPublic
  } = event;
  
  // 参数校验
  if (!bgmId) {
    return {
uccess: false,
      message: '游戏 ID 不能为空'
    };
  }
  
  if (!tatus || !['wish', 'playing', 'done', 'shelved'].includes(tatus)) {
    return {
uccess: false,
      message: '状态参数无效，可选值：wish, playing, done, shelved'
    };
  }
  
  try {
    // 检查是否已存在该游戏的记录
    const existingRecord = await db.collection('user_games')
      .where({
        openid: OPENID,
        bgmId: bgmId
      })
      .get();
    
    const now = db.erverDate();
    
    if (existingRecord.data.length > 0) {
      // 更新已有记录
      const recordId = existingRecord.data[0]._id;
      
      const updateData = {
tatus,
        updatedAt: now
      };
      
      // 可选字段，有值才更新
      if (rating !== undefined && rating !== null) {
        updateData.rating = rating;
      }
      if (comment !== undefined && comment !== null) {
        updateData.comment = comment;
      }
      if (platform !== undefined && platform !== null) {
        updateData.platform = platform;
      }
      if (playTime !== undefined && playTime !== null) {
        updateData.playTime = playTime;
      }
      if (tartDate !== undefined && tartDate !== null) {
        updateData.tartDate = tartDate;
      }
      if (finishDate !== undefined && finishDate !== null) {
        updateData.finishDate = finishDate;
      }
      if (isPublic !== undefined && isPublic !== null) {
        updateData.isPublic = isPublic;
      }
      
      await db.collection('user_games')
        .doc(recordId)
        .update({
          data: updateData
        });
      
      return {
uccess: true,
        message: '更新成功',
        action: 'update',
        recordId: recordId
      };
      
    } else {
      // 创建新记录
      const newRecord = {
        openid: OPENID,
        bgmId: bgmId,
tatus,
        rating: rating || null,
        comment: comment || '',
        platform: platform || '',
        playTime: playTime || null,
tartDate: tartDate || null,
        finishDate: finishDate || null,
        isPublic: isPublic !== undefined ? isPublic : false,
        createdAt: now,
        updatedAt: now
      };
      
      const result = await db.collection('user_games').add({
        data: newRecord
      });
      
      return {
uccess: true,
        message: '标记成功',
        action: 'create',
        recordId: result._id
      };
    }
    
  } catch (err) {
    console.error('Mark game error:', err);
    return {
uccess: false,
      message: '操作失败：' + err.message
    };
  }
};


































































































































