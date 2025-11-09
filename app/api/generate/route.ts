import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rawThoughts, tone, contextEmail, language } = body;

    if (!rawThoughts || !tone || !language) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const contextPart = contextEmail?.trim()
      ? `\n\nContext - I am responding to this email:\n"${contextEmail}"\n\n`
      : '';

    const languageMap: Record<string, string> = {
      'en-US': 'English',
      'de-DE': 'German',
      'fr-FR': 'French',
    };

    const prompt = `You are an expert email writer. Transform the following raw thoughts into a well-crafted email with a ${tone} tone.

Raw thoughts: "${rawThoughts}"${contextPart}

Instructions:
- Write a complete, professional email body
- Use a ${tone} tone throughout
- Make it clear, engaging, and well-structured
- Ensure proper email etiquette
- Do not include a subject line

Please respond in ${languageMap[language] || 'English'} language.

Respond with ONLY the email body content. Do not include any explanations or additional text outside of the email.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const generatedEmail = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

    return NextResponse.json({ generatedEmail });
  } catch (error) {
    console.error('Error generating email:', error);
    return NextResponse.json(
      { error: 'Failed to generate email' },
      { status: 500 }
    );
  }
}
