# 🚀 External APIs Setup Guide

## 📋 Overview
This app now integrates with external data sources to provide **real competitive intelligence and market trends** during the AI analysis phase.

## 🔑 Required API Keys

### 1. Crunchbase API
- **Purpose**: Fetch startup/competitor details, funding rounds, company metrics
- **Get API Key**: [Crunchbase Developer Portal](https://data.crunchbase.com/docs/using-the-api)
- **Cost**: Free tier available, paid plans for higher limits
- **Environment Variable**: `VITE_CRUNCHBASE_API_KEY`

### 2. SimilarWeb API
- **Purpose**: Website traffic stats, competitor rankings, user demographics
- **Get API Key**: [SimilarWeb API](https://www.similarweb.com/corp/developers/)
- **Cost**: Free tier available, paid plans for higher limits
- **Environment Variable**: `VITE_SIMILARWEB_API_KEY`

### 3. BuiltWith API
- **Purpose**: Identify technologies used by competitor websites
- **Get API Key**: [BuiltWith API](https://builtwith.com/api)
- **Cost**: Free tier available, paid plans for higher limits
- **Environment Variable**: `VITE_BUILTWITH_API_KEY`

## ⚙️ Setup Instructions

### Step 1: Create Environment File
Create a `.env` file in your project root:

```bash
# External API Keys for Competitive Intelligence
VITE_CRUNCHBASE_API_KEY=your_crunchbase_api_key_here
VITE_SIMILARWEB_API_KEY=your_similarweb_api_key_here
VITE_BUILTWITH_API_KEY=your_builtwith_api_key_here

# Google Gemini AI API Key (already configured)
VITE_GEMINI_API_KEY=AIzaSyDOHC6sTNMpkn94JrtyU47t8J6n7ZokfZ0
```

### Step 2: Get API Keys
1. **Crunchbase**: Sign up at [data.crunchbase.com](https://data.crunchbase.com/docs/using-the-api)
2. **SimilarWeb**: Sign up at [similarweb.com/corp/developers/](https://www.similarweb.com/corp/developers/)
3. **BuiltWith**: Sign up at [builtwith.com/api](https://builtwith.com/api)

### Step 3: Restart Development Server
```bash
npm run dev
```

## 🎯 What You Get

### With API Keys (Real Data):
- **Competitor Analysis**: Real funding data, employee counts, founding dates
- **Traffic Metrics**: Actual website traffic and rankings
- **Technology Stack**: Real technologies used by competitors
- **Market Trends**: Live Google Trends data
- **Market Size**: Industry-standard TAM/SAM/SOM estimates

### Without API Keys (Mock Data):
- **Realistic Mock Data**: Based on industry standards
- **Same Analysis Quality**: AI still provides professional insights
- **No API Costs**: Perfect for testing and development

## 🔍 Data Sources Used

### 1. Competitor Intelligence
- **Funding Rounds**: Total raised, last round type, investors
- **Company Metrics**: Employees, founding year, industry
- **Website Traffic**: Monthly visits, global rank, category rank
- **Technology Stack**: Frontend, backend, hosting, analytics

### 2. Market Trends
- **Keyword Analysis**: Search volume trends and growth rates
- **Geographic Interest**: Regional market interest levels
- **Related Queries**: What people search for alongside your terms
- **Trend Direction**: Rising, stable, or declining interest

### 3. Market Size Estimates
- **TAM (Total Addressable Market)**: Total market size
- **SAM (Serviceable Addressable Market)**: Your target segment
- **SOM (Serviceable Obtainable Market)**: Realistic capture potential

## 💡 Benefits

### For Users:
- **Data-Backed Insights**: Real market data, not just opinions
- **Competitive Intelligence**: Know your competition before starting
- **Market Validation**: See if trends support your idea
- **Professional Analysis**: Consultant-level insights with real data

### For Your Business:
- **Higher Conversion**: Users trust data-backed analysis
- **Better Decisions**: Real market intelligence for planning
- **Competitive Advantage**: Know what you're up against
- **Professional Image**: Top-tier business consultant experience

## 🚨 Important Notes

### API Rate Limits:
- **Crunchbase**: 1000 requests/month (free tier)
- **SimilarWeb**: 100 requests/month (free tier)
- **BuiltWith**: 100 requests/month (free tier)

### Data Accuracy:
- **Real-time**: Traffic and trend data is current
- **Historical**: Funding and company data may have delays
- **Estimates**: Market size data uses industry standards

### Privacy & Compliance:
- **Public Data**: All data is publicly available
- **No Personal Info**: Only company and website data
- **GDPR Compliant**: No user personal data collected

## 🔧 Troubleshooting

### Common Issues:
1. **API Key Invalid**: Check your API key format and permissions
2. **Rate Limit Exceeded**: Upgrade to paid plan or wait for reset
3. **Data Not Loading**: Check network connection and API status
4. **Mock Data Showing**: API keys not configured or invalid

### Debug Mode:
Check browser console for detailed error messages and API responses.

## 🎉 Ready to Go!

Once you've added your API keys, the app will automatically:
1. **Gather Real Data**: From all configured APIs
2. **Enhance AI Analysis**: With data-backed insights
3. **Show Competitive Intelligence**: Real market data
4. **Provide Professional Insights**: Like a top-tier consultant

Your users will get **unprecedented access to real market intelligence** during their business idea analysis! 🚀✨

