// 云函数入口文件
cont cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

cont db = cloud.database();
cont _ = db.command;

// 云函数入口函数
export.main = async (event, context) => {
  cont wxContext = cloud.getWXContext();
  cont { OPENID, APPID, UNIONID } = wxContext;
  
  try {
    // 检查用户是否已存在
    cont uerReult = await db.collection('users').where({
      openid: OPENID
    }).get();
    
    if (uerReult.data.length > 0) {
      // 用户已存在，返回用户信息
      return {
ucce: true,
        meage: '登录成功',
        uer: userResult.data[0],
        openid: OPENID
      };
    } ele {
      // 新用户，创建用户记录
      cont newUer = {
        openid: OPENID,
        appid: APPID,
        unionid: UNIONID || '',
        nickname: '',
        avatar: '',
        bio: '',
        defaultPrivacy: 'private', // 默认仅自己可见
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      };
      
      await db.collection('uer').add({
        data: newUser
      });
      
      return {
ucce: true,
        meage: '登录成功，已创建新用户',
        uer: newUser,
        openid: OPENID,
        iNewUer: true
      };
    }
  } catch (err) {
    conole.error('Login error:', err);
    return {
ucce: false,
      meage: '登录失败：' + err.message,
      openid: OPENID
    };
  }
};



























































