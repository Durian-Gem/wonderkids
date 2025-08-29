import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { CreateSessionDto, AddMessageDto } from './dto';

@Injectable()
export class TutorService {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Allowed topics for safety
  private readonly ALLOWED_TOPICS = [
    'animals', 'family', 'school', 'food', 'weather', 
    'hobbies', 'numbers', 'colors', 'body-parts', 'clothes'
  ];

  // Blocked words/phrases for safety
  private readonly BLOCKED_TERMS = [
    'password', 'address', 'phone', 'email', 'personal', 'secret',
    'home', 'location', 'where do you live', 'full name', 'last name',
    'age', 'birthday', 'school name', 'parent name', 'mommy', 'daddy'
  ];

  // Topic-specific system prompts for safety
  private getSystemPrompt(topic: string): string {
    const basePrompt = `You are a friendly English tutor for children aged 5-12. 
    Keep your responses to 1-2 short sentences. Use simple words and be encouraging.
    NEVER ask for or discuss personal information like names, addresses, ages, or family details.
    Focus only on the topic: ${topic}.
    If asked about anything inappropriate or personal, redirect to the topic in a friendly way.`;

    const topicPrompts = {
      animals: `${basePrompt} Talk about animals, their sounds, colors, and habitats. Example: "Cats say meow! They are soft and furry."`,
      family: `${basePrompt} Talk about family roles (mom, dad, sister, brother) but never ask about the child's specific family. Example: "Brothers and sisters like to play together!"`,
      school: `${basePrompt} Talk about school subjects, activities, and objects like books and pencils. Example: "Math is fun! We learn numbers and counting."`,
      food: `${basePrompt} Talk about healthy foods, fruits, vegetables, and meals. Example: "Apples are red and sweet! They are good for you."`,
      weather: `${basePrompt} Talk about sunny, rainy, cloudy, and snowy weather. Example: "The sun makes everything bright and warm!"`,
      hobbies: `${basePrompt} Talk about fun activities like reading, drawing, and sports. Example: "Drawing pictures is creative and fun!"`,
      numbers: `${basePrompt} Talk about counting, simple math, and number games. Example: "One, two, three! Counting is easy."`,
      colors: `${basePrompt} Talk about different colors and things that are those colors. Example: "The sky is blue and grass is green!"`,
      'body-parts': `${basePrompt} Talk about basic body parts like head, hands, feet in an educational way. Example: "We use our hands to wave hello!"`,
      clothes: `${basePrompt} Talk about different clothes and when we wear them. Example: "We wear coats when it's cold outside!"`
    };

    return topicPrompts[topic] || basePrompt;
  }

  private validateTopic(topic: string): void {
    if (!this.ALLOWED_TOPICS.includes(topic)) {
      throw new BadRequestException(`Topic '${topic}' is not allowed. Choose from: ${this.ALLOWED_TOPICS.join(', ')}`);
    }
  }

  private validateMessage(content: string): void {
    const lowerContent = content.toLowerCase();
    
    // Check for blocked terms
    for (const term of this.BLOCKED_TERMS) {
      if (lowerContent.includes(term.toLowerCase())) {
        throw new BadRequestException('Let\'s keep our conversation about learning English! Try asking about the topic instead.');
      }
    }

    // Simple word count check (roughly 60 words max)
    const wordCount = content.trim().split(/\s+/).length;
    if (wordCount > 60) {
      throw new BadRequestException('Please keep your message shorter - try using fewer words!');
    }
  }

  async createSession(userId: string, createSessionDto: CreateSessionDto) {
    this.validateTopic(createSessionDto.topic);

    // If childId is provided, verify it belongs to the user
    if (createSessionDto.childId) {
      const { data: child, error: childError } = await this.supabase
        .from('children')
        .select('guardian_id')
        .eq('id', createSessionDto.childId)
        .single();

      if (childError || !child) {
        throw new NotFoundException('Child not found');
      }

      if (child.guardian_id !== userId) {
        throw new ForbiddenException('Not authorized to create session for this child');
      }
    }

    const systemPrompt = this.getSystemPrompt(createSessionDto.topic);

    const { data, error } = await this.supabase
      .from('ai_sessions')
      .insert({
        user_id: userId,
        child_id: createSessionDto.childId || null,
        topic: createSessionDto.topic,
        provider: 'anthropic',
        system_prompt: systemPrompt,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }

    // Add initial system message
    await this.supabase
      .from('ai_messages')
      .insert({
        session_id: data.id,
        sender: 'system',
        content: systemPrompt,
      });

    return { 
      data: {
        ...data,
        messages: []
      }, 
      success: true, 
      message: 'Tutor session created successfully' 
    };
  }

  async addMessage(userId: string, sessionId: string, addMessageDto: AddMessageDto) {
    this.validateMessage(addMessageDto.content);

    // Verify session belongs to user or user's child
    const { data: session, error: sessionError } = await this.supabase
      .from('ai_sessions')
      .select(`
        *,
        children (guardian_id)
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      throw new NotFoundException('Session not found');
    }

    const hasAccess = session.user_id === userId || 
      (session.children && session.children.guardian_id === userId);

    if (!hasAccess) {
      throw new ForbiddenException('Not authorized to access this session');
    }

    // Add user message
    const { data: userMessage, error: userError } = await this.supabase
      .from('ai_messages')
      .insert({
        session_id: sessionId,
        sender: 'user',
        content: addMessageDto.content,
      })
      .select()
      .single();

    if (userError) {
      throw new Error(`Failed to save user message: ${userError.message}`);
    }

    // Generate AI response (simplified for v1 - using static responses)
    const aiResponse = this.generateSimpleResponse(session.topic, addMessageDto.content);

    // Add AI message
    const { data: aiMessage, error: aiError } = await this.supabase
      .from('ai_messages')
      .insert({
        session_id: sessionId,
        sender: 'assistant',
        content: aiResponse,
      })
      .select()
      .single();

    if (aiError) {
      throw new Error(`Failed to save AI message: ${aiError.message}`);
    }

    return {
      data: {
        userMessage,
        aiMessage
      },
      success: true,
      message: 'Messages exchanged successfully'
    };
  }

  async getSession(userId: string, sessionId: string) {
    const { data: session, error: sessionError } = await this.supabase
      .from('ai_sessions')
      .select(`
        *,
        ai_messages (
          id,
          sender,
          content,
          created_at
        ),
        children (guardian_id)
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      throw new NotFoundException('Session not found');
    }

    const hasAccess = session.user_id === userId || 
      (session.children && session.children.guardian_id === userId);

    if (!hasAccess) {
      throw new ForbiddenException('Not authorized to access this session');
    }

    // Filter out system messages for cleaner response
    const messages = session.ai_messages
      .filter(msg => msg.sender !== 'system')
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return {
      data: {
        ...session,
        messages
      },
      success: true
    };
  }

  async getUserSessions(userId: string) {
    const { data, error } = await this.supabase
      .from('ai_sessions')
      .select(`
        id,
        topic,
        created_at,
        children (id, name)
      `)
      .or(`user_id.eq.${userId},children.guardian_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      throw new Error(`Failed to fetch sessions: ${error.message}`);
    }

    return { data, success: true };
  }

  // Simple response generation for v1 (upgrade to real AI later)
  private generateSimpleResponse(topic: string, userMessage: string): string {
    const responses = {
      animals: [
        "Animals are amazing! They come in many shapes and sizes.",
        "I love talking about animals! They can be pets or wild.",
        "Animals make different sounds. Dogs bark and cats meow!",
        "Some animals are big like elephants, others are small like mice."
      ],
      family: [
        "Families are special! They love and care for each other.",
        "Brothers and sisters can be great friends and playmates.",
        "Families like to spend time together and have fun.",
        "Every family is different and unique in their own way."
      ],
      school: [
        "School is where we learn many exciting things!",
        "Reading books helps us learn new words and stories.",
        "Math teaches us about numbers and counting.",
        "Art class lets us be creative with colors and drawing."
      ],
      food: [
        "Healthy food helps our bodies grow strong!",
        "Fruits like apples and bananas taste sweet and good.",
        "Vegetables give us energy to play and learn.",
        "Drinking water keeps us healthy and happy."
      ],
      weather: [
        "Weather changes every day! Sometimes sunny, sometimes rainy.",
        "Sunny days are perfect for playing outside!",
        "Rain helps flowers and trees grow big and strong.",
        "Snow is cold and white, perfect for making snowmen!"
      ],
      hobbies: [
        "Hobbies are fun activities we love to do!",
        "Drawing and coloring help us be creative artists.",
        "Reading books takes us on exciting adventures.",
        "Playing sports keeps our bodies healthy and strong."
      ],
      numbers: [
        "Numbers are everywhere! We use them every day.",
        "Counting is fun! One, two, three, let's count together!",
        "Math helps us solve puzzles and problems.",
        "Adding numbers together makes bigger numbers!"
      ],
      colors: [
        "Colors make the world bright and beautiful!",
        "Red is the color of strawberries and fire trucks.",
        "Blue is like the ocean and the sky above us.",
        "Green is the color of grass and leaves on trees."
      ],
      'body-parts': [
        "Our body parts help us do many things!",
        "We use our eyes to see beautiful things around us.",
        "Our hands help us write, draw, and play games.",
        "Our feet help us walk, run, and dance!"
      ],
      clothes: [
        "Clothes keep us warm and help us look nice!",
        "We wear different clothes for different weather.",
        "Coats keep us warm when it's cold outside.",
        "T-shirts are perfect for hot summer days!"
      ]
    };

    const topicResponses = responses[topic] || responses.animals;
    return topicResponses[Math.floor(Math.random() * topicResponses.length)];
  }
}
