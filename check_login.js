const jwt = require('jsonwebtoken');

// 模拟从localStorage获取token
const token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjoxLCJuYW1lIjoibmljb25pY28iLCJhdmF0YXIiOiIvaW1hZ2VzL2RlZmF1bHRfYXZhdGFyLmpwZyIsImlhdCI6MTczMzM2MTU5MywiZXhwIjoxNzMzMzY1MTkzfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8";

try {
    // 移除Bearer前缀
    const tokenWithoutBearer = token.replace('Bearer ', '');
    
    // 解码JWT
    const decoded = jwt.decode(tokenWithoutBearer);
    
    console.log('JWT解码结果:', decoded);
    
    if (decoded) {
        console.log('用户ID:', decoded.id_user);
        console.log('用户名:', decoded.name);
        console.log('头像:', decoded.avatar);
    }
} catch (error) {
    console.error('解码失败:', error);
} 