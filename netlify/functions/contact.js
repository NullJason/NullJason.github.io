const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        const { name, email, subject, message } = JSON.parse(event.body);
        
        // Validate required fields
        if (!name || !email || !subject || !message) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        // Create issue in GitHub
        const issueResponse = await fetch(
            `https://api.github.com/repos/${process.env.GITHUB_USERNAME}/PrivateMailing/issues`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `token ${process.env.GITHUB_PAT}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: `Contact: ${subject.substring(0, 50)}${subject.length > 50 ? '...' : ''}`,
                    body: `
**New Contact Form Submission** 📧

**From:** ${name}  
**Email:** ${email}  
**Subject:** ${subject}  
**Timestamp:** ${new Date().toISOString()}

**Message:**
${message}

---
*Automatically generated from portfolio contact form*
                    `.trim(),
                    labels: ['contact-form', 'portfolio']
                })
            }
        );

        if (!issueResponse.ok) {
            const errorText = await issueResponse.text();
            console.error('GitHub API error:', errorText);
            throw new Error(`GitHub API returned ${issueResponse.status}`);
        }

        const issueData = await issueResponse.json();

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                success: true, 
                message: 'Contact form submitted successfully',
                issue_url: issueData.html_url
            })
        };

    } catch (error) {
        console.error('Error processing contact form:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                error: 'Failed to process contact form submission',
                details: error.message
            })
        };
    }
};
