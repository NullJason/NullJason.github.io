exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { event_type, client_payload } = JSON.parse(event.body);
    
    if (event_type !== 'contact-form-submission') {
        return { statusCode: 400, body: 'Invalid event type' };
    }

    const response = await fetch(`https://api.github.com/repos/${process.env.GITHUB_USERNAME}/PrivateMailing/issues`, {
        method: 'POST',
        headers: {
            'Authorization': `token ${process.env.GITHUB_PAT}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: `Contact: ${client_payload.subject}`,
            body: `
**New Contact Form Submission** 📧

**From:** ${client_payload.name}  
**Email:** ${client_payload.email}  
**Subject:** ${client_payload.subject}  
**Timestamp:** ${new Date().toISOString()}

**Message:**
${client_payload.message}

---
*Automatically generated from portfolio contact form*
            `,
            labels: ['contact-form', 'portfolio']
        })
    });

    if (response.ok) {
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Issue created successfully' })
        };
    } else {
        return {
            statusCode: response.status,
            body: JSON.stringify({ error: 'Failed to create issue' })
        };
    }
};
