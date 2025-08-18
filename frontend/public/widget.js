/**
 * TestimonialFlow Widget
 * Embeddable testimonial display widget
 */

(function() {
  'use strict';

  // Default configuration
  const DEFAULT_CONFIG = {
    apiUrl: 'http://localhost:8000',
    theme: 'light',
    layout: 'cards',
    limit: 4,
    showVideos: true,
    autoRefresh: false,
    refreshInterval: 30000, // 30 seconds
    showDates: true,
    showRatings: false,
    animation: 'fade'
  };

  // CSS Styles for the widget
  const WIDGET_STYLES = `
    .testimonial-widget {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.5;
      color: #374151;
    }
    
    .testimonial-widget.theme-light {
      background-color: #ffffff;
      color: #374151;
    }
    
    .testimonial-widget.theme-dark {
      background-color: #1f2937;
      color: #f3f4f6;
    }
    
    .testimonial-widget-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      color: #6b7280;
    }
    
    .testimonial-widget-error {
      padding: 1rem;
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 0.5rem;
      color: #b91c1c;
      text-align: center;
    }
    
    .theme-dark .testimonial-widget-error {
      background-color: #7f1d1d;
      border-color: #dc2626;
      color: #f87171;
    }
    
    /* Cards Layout */
    .testimonial-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
      padding: 1rem 0;
    }
    
    .testimonial-card {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      position: relative;
    }
    
    .theme-dark .testimonial-card {
      background: #374151;
      border-color: #4b5563;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }
    
    .testimonial-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .theme-dark .testimonial-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }
    
    /* List Layout */
    .testimonial-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem 0;
    }
    
    .testimonial-list-item {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 1rem 1.5rem;
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      transition: all 0.2s ease;
    }
    
    .theme-dark .testimonial-list-item {
      background: #374151;
      border-color: #4b5563;
    }
    
    .testimonial-list-item:hover {
      border-color: #3b82f6;
    }
    
    /* Content Styles */
    .testimonial-content {
      flex: 1;
    }
    
    .testimonial-text {
      margin-bottom: 1rem;
      font-size: 1rem;
      line-height: 1.6;
      quotes: '"' '"' ''' ''';
    }
    
    .testimonial-text::before {
      content: open-quote;
      font-size: 1.25em;
      color: #6b7280;
    }
    
    .testimonial-text::after {
      content: close-quote;
      font-size: 1.25em;
      color: #6b7280;
    }
    
    .testimonial-author {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 1rem;
    }
    
    .testimonial-name {
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }
    
    .theme-dark .testimonial-name {
      color: #f9fafb;
    }
    
    .testimonial-date {
      font-size: 0.875rem;
      color: #6b7280;
    }
    
    .testimonial-video {
      width: 100%;
      max-width: 300px;
      height: auto;
      border-radius: 0.5rem;
      margin-top: 1rem;
    }
    
    .testimonial-video-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.5rem;
      height: 1.5rem;
      background-color: #3b82f6;
      border-radius: 50%;
      margin-left: 0.5rem;
    }
    
    .testimonial-video-icon::after {
      content: '▶';
      color: white;
      font-size: 0.75rem;
    }
    
    /* Animation */
    .testimonial-widget-fade-in {
      animation: testimonialFadeIn 0.5s ease-in-out;
    }
    
    @keyframes testimonialFadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .testimonial-cards {
        grid-template-columns: 1fr;
      }
      
      .testimonial-list-item {
        flex-direction: column;
        align-items: stretch;
      }
      
      .testimonial-video {
        max-width: 100%;
      }
    }
    
    /* Empty State */
    .testimonial-empty {
      text-align: center;
      padding: 3rem 1rem;
      color: #6b7280;
    }
    
    .testimonial-empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }
  `;

  // Widget Class
  class TestimonialWidget {
    constructor(options) {
      this.config = { ...DEFAULT_CONFIG, ...options };
      this.container = typeof this.config.container === 'string' 
        ? document.getElementById(this.config.container)
        : this.config.container;
      
      if (!this.container) {
        console.error('TestimonialWidget: Container not found');
        return;
      }
      
      this.testimonials = [];
      this.isLoading = false;
      this.refreshTimer = null;
      
      this.init();
    }

    init() {
      this.injectStyles();
      this.setupContainer();
      this.loadTestimonials();
      
      if (this.config.autoRefresh) {
        this.startAutoRefresh();
      }
    }

    injectStyles() {
      if (!document.getElementById('testimonial-widget-styles')) {
        const style = document.createElement('style');
        style.id = 'testimonial-widget-styles';
        style.textContent = WIDGET_STYLES;
        document.head.appendChild(style);
      }
    }

    setupContainer() {
      this.container.className = `testimonial-widget theme-${this.config.theme}`;
      this.container.TestimonialFlowWidget = this; // Store reference for external access
    }

    async loadTestimonials() {
      if (this.isLoading) return;
      
      this.isLoading = true;
      this.showLoading();

      try {
        const response = await fetch(
          `${this.config.apiUrl}/testimonials/${this.config.userId}?approved_only=true&limit=${this.config.limit}`
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        this.testimonials = data.testimonials || [];
        this.render();
      } catch (error) {
        console.error('Failed to load testimonials:', error);
        this.showError('Failed to load testimonials. Please try again later.');
      } finally {
        this.isLoading = false;
      }
    }

    showLoading() {
      this.container.innerHTML = `
        <div class="testimonial-widget-loading">
          <div style="margin-right: 8px;">Loading testimonials...</div>
          <div style="animation: spin 1s linear infinite;">⟳</div>
        </div>
      `;
    }

    showError(message) {
      this.container.innerHTML = `
        <div class="testimonial-widget-error">
          ${message}
        </div>
      `;
    }

    render() {
      if (this.testimonials.length === 0) {
        this.container.innerHTML = `
          <div class="testimonial-empty">
            <div class="testimonial-empty-icon">💬</div>
            <p>No testimonials available yet.</p>
          </div>
        `;
        return;
      }

      const html = this.config.layout === 'cards' 
        ? this.renderCards() 
        : this.renderList();

      this.container.innerHTML = html;
      
      if (this.config.animation === 'fade') {
        this.container.classList.add('testimonial-widget-fade-in');
      }
    }

    renderCards() {
      const cards = this.testimonials.map(testimonial => `
        <div class="testimonial-card">
          <div class="testimonial-content">
            <p class="testimonial-text">${this.escapeHtml(testimonial.text)}</p>
            ${this.config.showVideos && testimonial.video_url ? this.renderVideo(testimonial.video_url) : ''}
            <div class="testimonial-author">
              <h4 class="testimonial-name">
                ${this.escapeHtml(testimonial.name)}
                ${testimonial.video_url ? '<span class="testimonial-video-icon"></span>' : ''}
              </h4>
              ${this.config.showDates ? `<span class="testimonial-date">${this.formatDate(testimonial.created_at)}</span>` : ''}
            </div>
          </div>
        </div>
      `).join('');

      return `<div class="testimonial-cards">${cards}</div>`;
    }

    renderList() {
      const items = this.testimonials.map(testimonial => `
        <div class="testimonial-list-item">
          <div class="testimonial-content">
            <p class="testimonial-text">${this.escapeHtml(testimonial.text)}</p>
            ${this.config.showVideos && testimonial.video_url ? this.renderVideo(testimonial.video_url) : ''}
            <div class="testimonial-author">
              <h4 class="testimonial-name">
                ${this.escapeHtml(testimonial.name)}
                ${testimonial.video_url ? '<span class="testimonial-video-icon"></span>' : ''}
              </h4>
              ${this.config.showDates ? `<span class="testimonial-date">${this.formatDate(testimonial.created_at)}</span>` : ''}
            </div>
          </div>
        </div>
      `).join('');

      return `<div class="testimonial-list">${items}</div>`;
    }

    renderVideo(videoUrl) {
      return `
        <video class="testimonial-video" controls preload="metadata">
          <source src="${this.escapeHtml(videoUrl)}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      `;
    }

    formatDate(dateString) {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch (error) {
        return '';
      }
    }

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    refresh() {
      this.loadTestimonials();
    }

    startAutoRefresh() {
      this.stopAutoRefresh();
      this.refreshTimer = setInterval(() => {
        this.loadTestimonials();
      }, this.config.refreshInterval);
    }

    stopAutoRefresh() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
        this.refreshTimer = null;
      }
    }

    destroy() {
      this.stopAutoRefresh();
      if (this.container) {
        this.container.innerHTML = '';
        this.container.className = '';
        delete this.container.TestimonialFlowWidget;
      }
    }

    updateConfig(newConfig) {
      this.config = { ...this.config, ...newConfig };
      this.setupContainer();
      this.render();
      
      if (this.config.autoRefresh) {
        this.startAutoRefresh();
      } else {
        this.stopAutoRefresh();
      }
    }
  }

  // Auto-initialize widgets with data attributes
  function autoInit() {
    const widgets = document.querySelectorAll('[data-testimonial-widget]');
    widgets.forEach(element => {
      if (!element.TestimonialFlowWidget) {
        const config = {
          container: element,
          userId: element.dataset.userId || element.dataset.testimonialUserId,
          theme: element.dataset.theme || 'light',
          layout: element.dataset.layout || 'cards',
          limit: parseInt(element.dataset.limit) || 4,
          showVideos: element.dataset.showVideos !== 'false',
          autoRefresh: element.dataset.autoRefresh === 'true',
          showDates: element.dataset.showDates !== 'false'
        };

        new TestimonialWidget(config);
      }
    });
  }

  // Expose to global scope
  window.TestimonialFlow = {
    Widget: TestimonialWidget,
    autoInit: autoInit
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

  // Re-run auto-init when new elements are added (for SPAs)
  if (window.MutationObserver) {
    const observer = new MutationObserver(() => {
      setTimeout(autoInit, 100);
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
})();