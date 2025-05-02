const notificationTemplates = [
  // Broadcasting message templates
  {
    type: "broadcast",
    title: "Platform Announcement",
    messageTemplate:
      "Exciting news! Our platform just got a major update with new features.",
    variables: [],
  },
  {
    type: "broadcast",
    title: "New Event",
    messageTemplate:
      "Join us this weekend for our virtual networking mixer! Connect with professionals in your industry.",
    variables: [],
  },
  {
    type: "broadcast",
    title: "Community News",
    messageTemplate:
      "Our community just reached 100,000 members! Thanks for being part of our growing network.",
    variables: [],
  },
  {
    type: "broadcast",
    title: "Platform Update",
    messageTemplate:
      "We've enhanced our messaging system for better performance and reliability. Check it out now!",
    variables: [],
  },
  {
    type: "broadcast",
    title: "Special Promotion",
    messageTemplate:
      "Flash sale! Upgrade to Premium for 50% off for the next 48 hours only. Don't miss out!",
    variables: [],
  },
  {
    type: "broadcast",
    title: "Community Milestone",
    messageTemplate:
      "We're celebrating 5 years of connecting professionals worldwide! Thanks for being part of our journey.",
    variables: [],
  },
  {
    type: "broadcast",
    title: "Scheduled Maintenance",
    messageTemplate:
      "Brief maintenance scheduled for tonight from 2-4 AM EST. Service will be faster and more reliable afterward!",
    variables: [],
  },
  {
    type: "broadcast",
    title: "Community Survey",
    messageTemplate:
      "Help us improve! Take our 2-minute survey and get a chance to win a free year of Premium membership.",
    variables: [],
  },
  {
    type: "broadcast",
    title: "Platform Tip",
    messageTemplate:
      "Did you know you can customize your notification settings? Go to Settings > Notifications to tailor your experience.",
    variables: [],
  },
  {
    type: "broadcast",
    title: "Important Alert",
    messageTemplate:
      "Security update: We've added new privacy features to protect your data. Update your app now!",
    variables: [],
  },

  // Connection-related templates
  {
    type: "connection_request",
    title: "New Connection Request",
    messageTemplate: "{{senderName}} sent you a connection request",
    variables: ["senderName"],
  },
  {
    type: "connection_accepted",
    title: "Connection Request Accepted",
    messageTemplate: "{{receiverName}} accepted your connection request",
    variables: ["receiverName"],
  },
  {
    type: "connection_rejected",
    title: "Connection Request Declined",
    messageTemplate: "{{receiverName}} declined your connection request",
    variables: ["receiverName"],
  },
  {
    type: "connection_reminder",
    title: "Connection Request Reminder",
    messageTemplate:
      "You have a pending connection request from {{senderName}}",
    variables: ["senderName"],
  },
  {
    type: "connection_removed",
    title: "Connection Removed",
    messageTemplate: "{{userName}} is no longer connected with you",
    variables: ["userName"],
  },

  // Like-related templates
  {
    type: "like",
    title: "Profile Like",
    messageTemplate: "{{userName}} liked your profile",
    variables: ["userName"],
  },

  {
    type: "unlike",
    title: "Post Unlike",
    messageTemplate: "{{userName}} removed their like from your post",
    variables: ["userName"],
  },
];

// MongoDB insertion script
const insertTemplates = async () => {
  try {
    const result = await NotificationTemplate.insertMany(notificationTemplates);
    console.log(
      `${result.length} notification templates inserted successfully`
    );
  } catch (error) {
    console.error("Error inserting notification templates:", error);
  }
};
