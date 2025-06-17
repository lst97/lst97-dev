// Available terminal commands for autocomplete
export const AVAILABLE_COMMANDS = ['/help', '/clear', '/privacy', '/terms', '/disclaimer', '/about']

// Terminal commands and their responses
export const TERMINAL_COMMANDS = {
  '/help': () => `**Available Commands:**

• **/clear** - Clear the chat history

• **/help** - Show this help message

• **/privacy** - View privacy policy

• **/terms** - View terms and conditions

• **/disclaimer** - View AI disclaimer

• **/about** - About Nelson AI Assistant

**Usage:**
Type any command above or ask me anything! I'm here to help with questions about lst97's portfolio, projects, and services.

**Tips:**

• Use Shift+Enter for new lines

• Commands are case-insensitive

• I can provide information about projects, skills, and contact details`,

  '/privacy': () => `**Privacy Policy - Data Collection Notice**

**Information We Collect:**
When you use this AI chat service, we automatically collect and log the following information for service improvement and security purposes:

• **IP Address** - Your public IP address for rate limiting and abuse prevention

• **User Agent** - Your browser and device information for compatibility optimization

• **Location Data** - General geographic location (country/region) derived from IP address

• **Chat Messages** - Your questions and our responses for service improvement

• **Timestamps** - When interactions occur for analytics and debugging

**Purpose of Data Collection:**

• Improve AI response quality and accuracy

• Prevent spam and abuse

• Analyze usage patterns for service optimization

• Debug technical issues

• Ensure service security and stability

**Data Retention:**

• Chat logs are retained for up to 90 days

• Analytics data may be retained longer in anonymized form

**Contact:** For privacy concerns, email: privacy@lst97.dev

*Last updated: ${new Date().toLocaleDateString()}*`,

  '/terms': () => `**Terms and Conditions**

**Acceptable Use Policy:**
By using this AI chat service, you agree to:

**✅ Permitted Activities:**

• Ask questions about lst97's portfolio, projects, and services

• Request information about skills, experience, and contact details

• Engage in professional discussions about web development, AI, and technology

• Provide feedback about the website and services

**❌ Prohibited Activities:**

• Attempting to hack, exploit, or damage the service

• Sending spam, malicious content, or inappropriate material

• Trying to extract sensitive information or bypass security measures

• Using the service for illegal activities or harassment

• Attempting prompt injection or jailbreaking the AI

• Sharing personal sensitive information (yours or others')

• Commercial use without explicit permission

**Service Limitations:**

• Service availability is not guaranteed 24/7

• Response quality may vary

• We reserve the right to limit usage for abuse prevention

• Conversations may be monitored for quality and safety

**Liability:**

• Use this service at your own risk

• We are not liable for any damages from service use

• Information provided is for general purposes only

**Termination:**
We reserve the right to terminate access for violations of these terms.

**Contact:** For terms questions, email: legal@lst97.dev

*Last updated: ${new Date().toLocaleDateString()}*`,

  '/disclaimer': () => `**AI Assistant Disclaimer**

**⚠️ Important Notice About AI Responses:**

**Accuracy Limitations:**

• **AI May Make Mistakes** - This AI assistant can provide incorrect, outdated, or incomplete information

• **Not Always Current** - Information may not reflect the most recent updates to projects or services

• **Interpretation Errors** - The AI might misunderstand your questions or provide irrelevant answers

**Verification Recommended:**

• **Double-Check Important Information** - Always verify critical details through official channels

• **Contact Directly** - For accurate project details, pricing, or business inquiries, contact lst97 directly

• **Official Sources** - Refer to the main website sections for authoritative information

**What This AI Knows:**

• General information about lst97's portfolio and services

• Technical background and project highlights

• Contact information and general inquiries

• Web development and technology topics

**What This AI Cannot Do:**

• Make binding commitments or agreements

• Provide real-time project status updates

• Access private or confidential information

• Guarantee accuracy of all responses

**Best Practices:**

• Use this chat for general inquiries and initial information gathering

• Follow up with direct contact for important matters

• Cross-reference information with official documentation

**Human Contact:** For critical inquiries, reach out directly via the contact form or email.

*This disclaimer helps ensure transparent and responsible AI interaction.*`,

  '/about': () => `**About Nelson AI Assistant**

**Who Am I?**
I'm Nelson, an AI assistant created to help visitors learn about lst97's portfolio, projects, and services. I'm designed to be helpful, informative, and professional.

**What I Can Help With:**

• **Portfolio Information** - Details about lst97's projects, skills, and experience

• **Service Inquiries** - Information about web development, consulting, and freelance services

• **Technical Questions** - General web development, AI, and technology discussions

• **Contact Assistance** - Help with getting in touch or finding the right information

**My Capabilities:**

• Natural language conversation

• Markdown formatting for better readability

• Command-based interactions (try /help)

• Professional and friendly communication style

**My Limitations:**

• I may not have the most current information

• I cannot make business commitments or agreements

• I cannot access private or confidential data

• I may occasionally make mistakes (see /disclaimer)

**Privacy & Security:**

• Our conversations are logged for service improvement

• I follow strict content policies and security measures

• See /privacy for detailed information about data handling

**Getting Started:**

• Try asking about lst97's projects or services

• Use /help to see available commands

• Feel free to ask follow-up questions for clarification

Ready to help! What would you like to know about lst97's work?`,

  '/clear': () => null, // Special case - handled separately
}
