import "dotenv/config";
import nodemailer from "nodemailer";

if (!process.env.VERIFICATION_SMTP_EMAIL || !process.env.VERIFICATION_SMTP_PASS) {
	console.error("[FetchEmail] SMTP credentials not found in environment variables.");
}

const transporter = nodemailer.createTransport({
	host: "box.skyfunnel.us",
	port: 465,
	secure: true,
	auth: {
		user: process.env.VERIFICATION_SMTP_EMAIL,
		pass: process.env.VERIFICATION_SMTP_PASS,
	},
});

export async function sendVerificationEmail(to: string, firstName: string) {
	const info = await transporter.sendMail({
		from: `"SkyFunnel.ai" <${process.env.VERIFICATION_SMTP_EMAIL}>`,
		to,
		subject: "Unleash Your Full Potential with SkyFunnel.ai – Elevate, Influence, and Achieve",
		replyTo: "hello@skyfunnel.ai",
		html: `
			<!DOCTYPE html>
			<html>
				<head>
					<link
						rel="preload"
						as="image"
						href="https://theprospect.s3.us-east-1.amazonaws.com/blog/1720314225439-7038058.jpg"
					/>
					<link
						rel="preload"
						as="image"
						href="https://theprospect.s3.us-east-1.amazonaws.com/blog/1727684494865-skyfunnel-full-logo.png"
					/>
				</head>
				<body>
					<div
						style="
							background-color: #f5f5f5;
							color: #262626;
							font-family: 'Helvetica Neue', 'Arial Nova', 'Nimbus Sans', Arial,
								sans-serif;
							font-size: 16px;
							font-weight: 400;
							letter-spacing: 0.15008px;
							line-height: 1.5;
							margin: 0;
							padding: 32px 0;
							min-height: 100%;
							width: 100%;
						"
					>
						<table
							align="center"
							width="100%"
							style="margin: 0 auto; max-width: 600px; background-color: #ffffff"
							role="presentation"
							cellspacing="0"
							cellpadding="0"
							border="0"
						>
							<tbody>
								<tr style="width: 100%">
									<td>
										<h2
											style="
												font-weight: bold;
												margin: 0;
												font-size: 24px;
												padding: 16px 24px 16px 24px;
											"
										>
											Hello ${firstName},
										</h2>
										<div style="padding: 16px 24px 16px 24px">
											<img
												alt="SkyFunnel Banner"
												src="https://theprospect.s3.us-east-1.amazonaws.com/blog/1720314225439-7038058.jpg"
												style="
													outline: none;
													border: none;
													text-decoration: none;
													vertical-align: middle;
													display: inline-block;
													max-width: 100%;
												"
											/>
										</div>
										<div style="font-weight: normal; padding: 16px 24px 16px 24px">
											As a marketer, we know your secret desires go beyond just
											launching campaigns. You're looking to transform your creativity
											into influence, see measurable impact, and ultimately shape the
											direction of the businesses you help grow. What if there was a
											way to not only meet those ambitions but to surpass them?
										</div>
										<div style="font-weight: normal; padding: 16px 24px 16px 24px">
											Introducing SkyFunnel.ai, your all-in-one platform designed to
											help you achieve what you truly desire:
										</div>
										<h3
											style="
												font-weight: bold;
												margin: 0;
												font-size: 20px;
												padding: 16px 24px 16px 24px;
											"
										>
											Always land in Inbox with unlimited warmups
										</h3>
										<div style="font-weight: normal; padding: 16px 24px 16px 24px">
											Set up unlimited warmup accounts and let our advanced systems
											boost your email deliverability automatically. Build trust with
											ISPs and make sure every email lands in the inbox, where it
											matters most.
										</div>
										<h3
											style="
												font-weight: bold;
												margin: 0;
												font-size: 20px;
												padding: 16px 24px 16px 24px;
											"
										>
											Reach with Scale – 100,000 Marketing Emails
										</h3>
										<div style="font-weight: normal; padding: 16px 24px 16px 24px">
											Imagine having the ability to send 100,000 emails each month,
											backed by advanced automation tools that guarantee your message
											gets seen. No more worrying about thresholds or delivery
											caps—just pure reach at your fingertips.
										</div>
										<h3
											style="
												font-weight: bold;
												margin: 0;
												font-size: 20px;
												padding: 16px 24px 16px 24px;
											"
										>
											Access to 1M+ Qualified Leads
										</h3>
										<div style="font-weight: normal; padding: 16px 24px 16px 24px">
											Stop wasting time chasing cold prospects. With SkyFunnel.ai, you
											get access to over 1 million qualified leads to fuel your
											campaigns. Whether you're targeting specific niches or broad
											markets, the power is in your hands to make an impact.
										</div>
										<h3
											style="
												font-weight: bold;
												margin: 0;
												font-size: 20px;
												padding: 16px 24px 16px 24px;
											"
										>
											WhatsApp Business API – Engage Like Never Before
										</h3>
										<div style="font-weight: normal; padding: 16px 24px 16px 24px">
											Scale your personal touch with bulk WhatsApp sending via the
											official WhatsApp Business API. Whether it's nurturing prospects
											or closing deals, your message will get through where your
											audience is most active.
										</div>
										<h3
											style="
												font-weight: bold;
												margin: 0;
												font-size: 20px;
												padding: 16px 24px 16px 24px;
											"
										>
											All the Tools You Need for Automation and Beyond
										</h3>
										<div style="font-weight: normal; padding: 16px 24px 16px 24px">
											Automate, track, and optimize every lead and every campaign—all
											from one intuitive platform. SkyFunnel.ai helps you focus on the
											strategy while we handle the execution.
										</div>
										<div
											style="
												color: #2563eb;
												font-weight: bold;
												padding: 16px 24px 16px 24px;
											"
										>
											We're excited to help you realize the full potential of your
											marketing strategies.
										</div>
										<div style="font-weight: normal; padding: 16px 24px 16px 24px">
											Like this email? This email was designed using SkyFunnel&#x27;s
											email builder.
										</div>
										<div style="padding: 16px 24px 16px 24px">
											<table
												align="center"
												width="100%"
												cellpadding="0"
												border="0"
												style="table-layout: fixed; border-collapse: collapse"
											>
												<tbody style="width: 100%">
													<tr style="width: 100%">
														<td
															style="
																box-sizing: content-box;
																vertical-align: middle;
																padding-left: 0;
																padding-right: 8px;
															"
														>
															<div
																style="text-align: center; padding: 0px 0px 0px 0px"
															>
																<a
																	href="https://skyfunnel.ai/"
																	style="
																		color: #ffffff;
																		font-size: 16px;
																		font-weight: bold;
																		background-color: #2563eb;
																		border-radius: 64px;
																		display: block;
																		padding: 12px 20px;
																		text-decoration: none;
																	"
																	target="_blank"
																	><span
																		><!--[if mso
																			]><i
																				style="
																					letter-spacing: 20px;
																					mso-font-width: -100%;
																					mso-text-raise: 30;
																				"
																				hidden
																				>&nbsp;</i
																			><!
																		[endif]--></span
																	><span>Website</span
																	><span
																		><!--[if mso
																			]><i
																				style="
																					letter-spacing: 20px;
																					mso-font-width: -100%;
																				"
																				hidden
																				>&nbsp;</i
																			><!
																		[endif]--></span
																	></a
																>
															</div>
														</td>
														<td
															style="
																box-sizing: content-box;
																vertical-align: middle;
																padding-left: 8px;
																padding-right: 0;
															"
														>
															<div
																style="text-align: center; padding: 0px 0px 0px 0px"
															>
																<a
																	href="https://app.skyfunnel.ai/register"
																	style="
																		color: #ffffff;
																		font-size: 16px;
																		font-weight: bold;
																		background-color: #16a34a;
																		border-radius: 64px;
																		display: block;
																		padding: 12px 20px;
																		text-decoration: none;
																	"
																	target="_blank"
																	><span
																		><!--[if mso
																			]><i
																				style="
																					letter-spacing: 20px;
																					mso-font-width: -100%;
																					mso-text-raise: 30;
																				"
																				hidden
																				>&nbsp;</i
																			><!
																		[endif]--></span
																	><span>Start Free Trial</span
																	><span
																		><!--[if mso
																			]><i
																				style="
																					letter-spacing: 20px;
																					mso-font-width: -100%;
																				"
																				hidden
																				>&nbsp;</i
																			><!
																		[endif]--></span
																	></a
																>
															</div>
														</td>
													</tr>
												</tbody>
											</table>
										</div>
										<div style="font-size: 16px; padding: 16px 24px 16px 24px">
											<table
												border="0"
												cellpadding="0"
												cellspacing="0"
												style="text-align: center; margin: auto"
											>
												<tr>
													<td>
														<a
															href="https://www.facebook.com/people/SkyFunnelai/61560390040422/"
															target="_blank"
															style="text-decoration: none"
														>
															<img
																src="https://cdn-icons-png.flaticon.com/24/733/733547.png"
																alt="Facebook"
																width="20"
																height="20"
																style="display: inline-block; margin-right: 10px"
															/>
														</a>
													</td>
													<td>
														<a
															href="https://www.instagram.com/skyfunnel.ai/"
															target="_blank"
															style="text-decoration: none"
														>
															<img
																src="https://cdn-icons-png.flaticon.com/24/733/733558.png"
																alt="Instagram"
																width="20"
																height="20"
																style="display: inline-block; margin-right: 10px"
															/>
														</a>
													</td>
													<td>
														<a
															href="https://www.linkedin.com/company/skyfunnel-ai/"
															target="_blank"
															style="text-decoration: none"
														>
															<img
																src="https://cdn-icons-png.flaticon.com/24/733/733561.png"
																alt="LinkedIn"
																width="20"
																height="20"
																style="display: inline-block"
															/>
														</a>
													</td>
												</tr>
											</table>
										</div>
										<div style="padding: 0px 0px 0px 0px; text-align: center">
											<img
												alt="SkyFunnel AI"
												src="https://theprospect.s3.us-east-1.amazonaws.com/blog/1727684494865-skyfunnel-full-logo.png"
												width="200"
												height="100"
												style="
													width: 200px;
													height: 100px;
													outline: none;
													border: none;
													text-decoration: none;
													vertical-align: middle;
													display: inline-block;
													max-width: 100%;
												"
											/>
										</div>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</body>
			</html>
		`,
	});

	console.log("Message sent: %s", info.messageId);
}
