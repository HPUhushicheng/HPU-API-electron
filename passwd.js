// Base64 编码
var originalText = '020812'; //发现密码也是base64加密的，可以验证一下
var encodedText = Buffer.from(originalText).toString('base64');
console.log('编码后的文本:', encodedText);  // 输出: MDIwODEy

// Base64 解码
var decodedText = Buffer.from(encodedText, 'base64').toString('utf8');
console.log('解码后的文本:', decodedText);  // 输出: 0812