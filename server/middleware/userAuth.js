import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  console.log("Cookies:", req.cookies);
  console.log("Token:", req.cookies.token);
  const { token } = req.cookies;
  if (!token) {
    return res.json({
      success: false,
      message: "Not Authorized 1, Login again",
    });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    console.log(tokenDecode);

    if (tokenDecode.id) {
      req.body = req.body || {};
      req.body.userId = tokenDecode.id;
      req.userId = tokenDecode.id;
    } else {
      return res.json({
        success: false,
        message: "Not Authorized 2, Login again",
      });
    }

    console.log(req.body.userId);

    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export default userAuth;
