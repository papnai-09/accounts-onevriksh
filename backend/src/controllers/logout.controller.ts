import { Request, Response } from "express";

export class LogoutController {
  async logout(req: Request, res: Response) {
    const { post_logout_redirect_uri, state } = req.query as any;

    // Clear session cookie on IdP
    res.clearCookie("onevriksh_session");

    if (post_logout_redirect_uri) {
      let redirectUrl = post_logout_redirect_uri;
      if (state) {
        redirectUrl += `${redirectUrl.includes("?") ? "&" : "?"}state=${encodeURIComponent(state)}`;
      }
      return res.redirect(302, redirectUrl);
    }

    return res.status(200).json({ success: true, message: "Logged out successfully" });
  }
}
