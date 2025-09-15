// Smart tag generation utility
export class TagGenerator {
  private static tagHistory: Map<string, number> = new Map();
  private static commonTags: Set<string> = new Set([
    'urgent', 'refund', 'quality', 'shipping', 'payment', 'authentication',
    'missing', 'damaged', 'delayed', 'cancelled', 'swap', 'customs',
    'courier', 'seller', 'buyer', 'technical', 'affiliate', 'discount'
  ]);

  static generateTags(title: string, description: string, issueCategory?: string, orderValue?: number): string[] {
    const text = `${title} ${description} ${issueCategory || ''}`.toLowerCase();
    const generatedTags: Set<string> = new Set();

    // Extract keywords and generate tags
    const keywords = this.extractKeywords(text);
    
    // Add category-based tags
    if (issueCategory) {
      const categoryTags = this.getCategoryTags(issueCategory);
      categoryTags.forEach(tag => generatedTags.add(tag));
    }

    // Add value-based tags
    if (orderValue) {
      const valueTags = this.getValueTags(orderValue);
      valueTags.forEach(tag => generatedTags.add(tag));
    }

    // Add keyword-based tags
    keywords.forEach(keyword => {
      if (this.commonTags.has(keyword) || this.tagHistory.has(keyword)) {
        generatedTags.add(keyword);
      }
    });

    // Add contextual tags based on content analysis
    const contextTags = this.getContextualTags(text);
    contextTags.forEach(tag => generatedTags.add(tag));

    const finalTags = Array.from(generatedTags).slice(0, 5); // Limit to 5 tags
    
    // Update tag history
    finalTags.forEach(tag => {
      const count = this.tagHistory.get(tag) || 0;
      this.tagHistory.set(tag, count + 1);
    });

    return finalTags;
  }

  private static extractKeywords(text: string): string[] {
    // Remove common words and extract meaningful keywords
    const stopWords = new Set([
      'the', 'is', 'at', 'which', 'on', 'and', 'a', 'to', 'are', 'as', 'was', 'were',
      'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'can', 'shall', 'for', 'of', 'with', 'by'
    ]);

    return text
      .split(/\s+/)
      .map(word => word.replace(/[^\w]/g, ''))
      .filter(word => word.length > 2 && !stopWords.has(word))
      .slice(0, 10);
  }

  private static getCategoryTags(category: string): string[] {
    const categoryMap: Record<string, string[]> = {
      'TID live but stuck or delayed': ['delayed', 'stuck', 'shipping'],
      'Missing Items': ['missing', 'incomplete'],
      'Order Lost by courier': ['lost', 'courier', 'shipping'],
      'Order stuck in customs': ['customs', 'international', 'delayed'],
      'Redelivery': ['redelivery', 'shipping'],
      'Damage in transit': ['damaged', 'shipping', 'quality'],
      'Order swap': ['swap', 'exchange'],
      'Cancellation': ['cancelled', 'refund'],
      'Discount vouchers': ['discount', 'voucher', 'promotion'],
      'Refunds not processed': ['refund', 'payment', 'processing'],
      'QC HOLD- Seller not responding': ['qc-hold', 'seller', 'quality'],
      'PQ- authenticity': ['authenticity', 'quality', 'verification'],
      'Tech related issues': ['technical', 'system', 'bug']
    };

    return categoryMap[category] || [];
  }

  private static getValueTags(orderValue: number): string[] {
    if (orderValue > 1000) return ['high-value'];
    if (orderValue > 500) return ['medium-value'];
    if (orderValue > 100) return ['standard-value'];
    return ['low-value'];
  }

  private static getContextualTags(text: string): string[] {
    const contextTags: string[] = [];

    // Priority indicators
    if (/urgent|asap|immediately|critical/i.test(text)) {
      contextTags.push('urgent');
    }

    // Payment related
    if (/payment|refund|money|charge|billing/i.test(text)) {
      contextTags.push('payment');
    }

    // Quality issues
    if (/quality|defect|broken|damaged|wrong/i.test(text)) {
      contextTags.push('quality');
    }

    // Shipping issues
    if (/shipping|delivery|courier|tracking|lost/i.test(text)) {
      contextTags.push('shipping');
    }

    return contextTags;
  }

  static getPopularTags(): string[] {
    return Array.from(this.tagHistory.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([tag]) => tag);
  }

  static getSuggestedTags(input: string): string[] {
    const inputLower = input.toLowerCase();
    const suggestions: string[] = [];

    // Add matching common tags
    this.commonTags.forEach(tag => {
      if (tag.includes(inputLower)) {
        suggestions.push(tag);
      }
    });

    // Add matching historical tags
    this.tagHistory.forEach((count, tag) => {
      if (tag.includes(inputLower) && !suggestions.includes(tag)) {
        suggestions.push(tag);
      }
    });

    return suggestions.slice(0, 10);
  }
}