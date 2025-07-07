export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  image?: {
    url: string;
  };
  thumbnail?: {
    url: string;
  };
  author?: {
    name: string;
  };
  footer?: {
    text: string;
  };
  timestamp?: string;
  fields?: Array<{
    name: string;
    value: string;
    inline: boolean;
  }>;
}

export interface User {
  username: string;
  password: string;
  role: 'admin' | 'user';
}

export interface TokenLog {
  token: string;
  timestamp: string;
  user: string;
  channelId: string;
}

export interface MessageLog {
  embed: DiscordEmbed;
  timestamp: string;
  user: string;
  channelId: string;
  status: string;
}

export interface EmbedFormData {
  botToken: string;
  channelId: string;
  botChannelId: string;
  embedTitle: string;
  embedDescription: string;
  embedColor: string;
  embedImage: string;
  embedThumbnail: string;
  embedAuthor: string;
  embedFooter: string;
  embedTimestamp: boolean;
}

export interface PurchaseLog {
  id: string;
  buyerName: string;
  amount: number;
  timestamp: string;
  status: string;
  paymentId: string;
}

export interface NewUserFormData {
  name: string;
  password: string;
  role: 'admin' | 'user';
}
