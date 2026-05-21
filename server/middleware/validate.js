function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0]?.message || '请求格式不正确。' });
      return;
    }
    req.body = result.data;
    next();
  };
}

module.exports = { validate };
