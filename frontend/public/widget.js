(function() {
  'use strict';

  // TestimonialFlow Widget
  class TestimonialWidget {
    constructor(options) {
      this.options = {
        userId: options.userId,
        container: options.container || 'testimonial-widget',
        theme: options.theme || 'light',
        limit: options.limit || 10,
        showVideos: options.showVideos !== false,
        autoRefresh: options.autoRefresh || 300000, // 5 minutes
        layout: options.layout || 'cards', // 'cards' or 'list'
        ...options
      };
      
      this.testimonials = [];
      this.apiUrl = this.getApiUrl();
      this.init();
    }

    getApiUrl() {
      const scripts = document.getElementsByTagName('script');
      const currentScript = scripts[scripts.length - 1];
      const src = currentScript.src;
      const baseUrl = src.substring(0, src.lastIndexOf('/'));
      return baseUrl.replace('/public', '/api/testimonials');
    }

    async init() {
      if (!this.options.userId) {
        console.error('TestimonialFlow Widget: userId is required');
        return;
      }

      await this.loadTestimonials();
      this.render();
      
      if (this.options.autoRefresh > 0) {
        setInterval(() => {
          this.loadTestimonials();
        }, this.options.autoRefresh);
      }
    }

    async loadTestimonials() {
      try {
        const response = await fetch(`${this.apiUrl}?user_id=${this.options.userId}&limit=${this.options.limit}`);
        
        if (!response.ok) {
          throw new Error('Failed to load testimonials');
        }
        
        const data = await response.json();
        this.testimonials = data.testimonials || [];
        
        if (this.container) {
          this.render();
        }
      } catch (error) {
        console.error('TestimonialFlow Widget Error:', error);
        this.renderError();
      }
    }

    render() {
      const container = document.getElementById(this.options.container);
      if (!container) {
        console.error(`TestimonialFlow Widget: Container with id "${this.options.container}" not found`);
        return;
      }

      if (this.testimonials.length === 0) {
        container.innerHTML = this.renderEmpty();
        return;
      }

      const html = this.options.layout === 'cards' 
        ? this.renderCards() 
        : this.renderList();
      
      container.innerHTML = html;
      this.container = container;
    }

    renderCards() {
      return `
        <div class="testimonial-widget testimonial-widget-${this.options.theme}">
          <style>
            .testimonial-widget {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              max-width: 100%;
            }
            .testimonial-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 1.5rem;
              margin: 0;
              padding: 0;
            }
            .testimonial-card {
              background: white;
              border-radius: 12px;
              padding: 1.5rem;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              border: 1px solid #e5e7eb;
              transition: transform 0.2s, box-shadow 0.2s;
            }
            .testimonial-card:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.15);
            }
            .testimonial-text {
              color: #374151;
              line-height: 1.6;
              margin-bottom: 1rem;
              font-size: 0.95rem;
            }
            .testimonial-author {
              color: #1f2937;
              font-weight: 600;
              font-size: 0.9rem;
            }
            .testimonial-date {
              color: #6b7280;
              font-size: 0.8rem;
              margin-top: 0.25rem;
            }
            .testimonial-video {
              width: 100%;
              max-width: 100%;
              height: auto;
              border-radius: 8px;
              margin-bottom: 1rem;
            }
            .testimonial-widget-dark .testimonial-card {
              background: #1f2937;
              border-color: #374151;
            }
            .testimonial-widget-dark .testimonial-text {
              color: #d1d5db;
            }
            .testimonial-widget-dark .testimonial-author {
              color: #f9fafb;
            }
            .testimonial-widget-dark .testimonial-date {
              color: #9ca3af;
            }
            @media (max-width: 768px) {
              .testimonial-grid {
                grid-template-columns: 1fr;
              }
              .testimonial-card {
                padding: 1rem;
              }
            }
          </style>
          <div class="testimonial-grid">
            ${this.testimonials.map(testimonial => `
              <div class="testimonial-card">
                ${testimonial.video_url && this.options.showVideos ? `
                  <video class="testimonial-video" controls>
                    <source src="${testimonial.video_url}" type="video/mp4">
                    Your browser does not support the video tag.
                  </video>
                ` : ''}
                <div class="testimonial-text">"${this.escapeHtml(testimonial.text)}"</div>
                <div class="testimonial-author">${this.escapeHtml(testimonial.name)}</div>
                <div class="testimonial-date">${this.formatDate(testimonial.created_at)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    renderList() {
      return `
        <div class="testimonial-widget testimonial-widget-${this.options.theme}">
          <style>
            .testimonial-widget {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              max-width: 100%;
            }
            .testimonial-list {
              space-y: 1rem;
            }
            .testimonial-item {
              background: white;
              border-radius: 8px;
              padding: 1.25rem;
              border-left: 4px solid #2563eb;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              margin-bottom: 1rem;
            }
            .testimonial-item:last-child {
              margin-bottom: 0;
            }
            .testimonial-text {
              color: #374151;
              line-height: 1.6;
              margin-bottom: 0.75rem;
              font-size: 0.95rem;
            }
            .testimonial-meta {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .testimonial-author {
              color: #1f2937;
              font-weight: 600;
              font-size: 0.9rem;
            }
            .testimonial-date {
              color: #6b7280;
              font-size: 0.8rem;
            }
            .testimonial-widget-dark .testimonial-item {
              background: #1f2937;
              border-left-color: #3b82f6;
            }
            .testimonial-widget-dark .testimonial-text {
              color: #d1d5db;
            }
            .testimonial-widget-dark .testimonial-author {
              color: #f9fafb;
            }
            .testimonial-widget-dark .testimonial-date {
              color: #9ca3af;
            }
          </style>
          <div class="testimonial-list">
            ${this.testimonials.map(testimonial => `
              <div class="testimonial-item">
                <div class="testimonial-text">"${this.escapeHtml(testimonial.text)}"</div>
                <div class="testimonial-meta">
                  <div class="testimonial-author">${this.escapeHtml(testimonial.name)}</div>
                  <div class="testimonial-date">${this.formatDate(testimonial.created_at)}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    renderEmpty() {
      return `
        <div class="testimonial-widget">
          <style>
            .testimonial-empty {
              text-align: center;
              padding: 2rem;
              color: #6b7280;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
          </style>
          <div class="testimonial-empty">
            <p>No testimonials available yet.</p>
          </div>
        </div>
      `;
    }

    renderError() {
      const container = document.getElementById(this.options.container);
      if (container) {
        container.innerHTML = `
          <div class="testimonial-widget">
            <style>
              .testimonial-error {
                text-align: center;
                padding: 2rem;
                color: #dc2626;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              }
            </style>
            <div class="testimonial-error">
              <p>Unable to load testimonials.</p>
            </div>
          </div>
        `;
      }
    }

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }

    // Public API methods
    refresh() {
      this.loadTestimonials();
    }

    setTheme(theme) {
      this.options.theme = theme;
      this.render();
    }

    setLayout(layout) {
      this.options.layout = layout;
      this.render();
    }
  }

  // Global API
  window.TestimonialFlow = {
    Widget: TestimonialWidget,
    
    // Convenience method for quick setup
    init: function(options) {
      return new TestimonialWidget(options);
    }
  };

  // Auto-initialize widgets with data attributes
  document.addEventListener('DOMContentLoaded', function() {
    const widgets = document.querySelectorAll('[data-testimonial-widget]');
    widgets.forEach(function(element) {
      const userId = element.getAttribute('data-user-id');
      const theme = element.getAttribute('data-theme') || 'light';
      const layout = element.getAttribute('data-layout') || 'cards';
      const limit = parseInt(element.getAttribute('data-limit')) || 10;
      const showVideos = element.getAttribute('data-show-videos') !== 'false';
      
      if (userId) {
        new TestimonialWidget({
          userId: userId,
          container: element.id,
          theme: theme,
          layout: layout,
          limit: limit,
          showVideos: showVideos
        });
      }
    });
  });
})();