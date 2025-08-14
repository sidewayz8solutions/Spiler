export function generateScript(donor) {
  const isPreviousDonor = donor.previous_donation_amount > 0
  const donorName = donor.first_name || donor.full_name?.split(' ')[0] || 'there'
  
  // Get time-based greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  
  // Generate personalized script
  const script = {
    opening: `${greeting} ${donorName}, this is {fundraiser_name} from {campaign_name}. ${
      isPreviousDonor 
        ? `Thank you so much for your previous support of $${donor.previous_donation_amount}. Your generosity made a real difference.`
        : `I'm reaching out to supporters in our community who care about making a difference.`
    } Do you have a moment to talk?`,
    
    pitch: isPreviousDonor
      ? `As you know from your previous involvement, we're working hard to [campaign goal]. Thanks to supporters like you, we've already [achievement]. Now we're in the final push and every contribution matters.`
      : `We're working to [campaign goal] and we're reaching out to community members who might be interested in supporting our cause. We've already [achievement] and with your help, we can [future goal].`,
    
    ask: isPreviousDonor
      ? `Would you consider matching or even increasing your previous donation of $${donor.previous_donation_amount}? Many of our supporters are doubling their impact this time around.`
      : `Would you be willing to support our campaign today? We have supporters contributing anywhere from $25 to $500, and every amount makes a difference.`,
    
    objections: {
      "I don't have money right now": isPreviousDonor
        ? "I completely understand. Would you consider a smaller amount, even $25 would help us reach our goal. Or we could schedule a pledge for next month?"
        : "I understand completely. Even a small contribution of $10 or $15 can make a difference. Or if you'd prefer, I can follow up with you next month.",
      
      "I already donated": "Thank you so much for your support! Your previous contribution means a lot. Many of our strongest supporters are choosing to give again to help us reach our goal. Would you consider an additional contribution?",
      
      "I need to think about it": "Of course, it's an important decision. Can I answer any questions about how the funds will be used? I'd also be happy to send you more information and follow up in a few days.",
      
      "Not interested": "I understand, and I appreciate you taking the time to speak with me. Before I go, is there anything specific about our campaign that concerns you? Your feedback is valuable to us.",
      
      "How will the money be used?": "Great question! [Specific breakdown of fund usage]. We're committed to transparency and can provide detailed reports on how every dollar is spent."
    },
    
    closing: `Thank you so much for your time today, ${donorName}. ${
      isPreviousDonor
        ? "Your continued support means everything to us."
        : "We're grateful for your consideration."
    } Have a wonderful ${hour >= 17 ? 'evening' : 'day'}!`
  }
  
  return script
}
