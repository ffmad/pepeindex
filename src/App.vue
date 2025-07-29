<template>
  <div class="app">
    <header class="header">
      <div class="header-left">
        <div class="title-container">
          <img src="/pepeusd-logo.png" alt="PepeUSD" class="title-logo" />
          <a href="/" class="title-link">
            <h1 class="title">PepeUSD Index Ladder</h1>
          </a>
        </div>
        <div class="external-links">
          <a href="https://pepeusd.lol/" target="_blank" rel="noopener noreferrer" class="external-link">
            <Icon icon="streamline-plump:web" class="link-icon" />
            <span>Website</span>
          </a>
          <a href="https://app.uniswap.org/swap?outputCurrency=0xed7fd16423Bc19b9143313ac5E4B7F731D714e97&chain=ethereum" target="_blank" rel="noopener noreferrer" class="external-link">
            <Icon icon="token:uniswap" class="link-icon" />
            <span>Uniswap</span>
          </a>
          <a href="https://dexscreener.com/ethereum/0x89bf2caee181c5266d9a3b3a800009a67174374f" target="_blank" rel="noopener noreferrer" class="external-link">
            <Icon icon="uil:chart" class="link-icon" />
            <span>DexScreener</span>
          </a>
          <a href="https://t.me/stablepepeusd" target="_blank" rel="noopener noreferrer" class="external-link">
            <Icon icon="simple-icons:telegram" class="link-icon" />
            <span>Telegram</span>
          </a>
        </div>
      </div>
      <div class="header-right">
        <div class="current-price">
          <span class="price-label">Current Price:</span>
          <span class="price-value">${{ pepeUsdPrice.toFixed(4) }}</span>
        </div>
        <div class="market-metrics">
          <div class="metric">
            <span class="metric-label">Market Cap:</span>
            <span class="metric-value">${{ formatNumber(marketCap) }}</span>
          </div>
          <div class="metric">
            <span class="metric-label">24h Volume:</span>
            <span class="metric-value">${{ formatNumber(volume24h) }}</span>
          </div>
        </div>
        <div class="last-updated">
          <Icon icon="material-symbols-light:update-rounded" class="update-icon" />
          <span>Updated {{ lastUpdated }}</span>
        </div>
      </div>
    </header>

        <div class="ladder-container">
              <!-- Up Navigation -->
        <div class="ladder-nav ladder-nav-top">
          <button @click="scrollUp" class="nav-button nav-up" :disabled="currentStep >= ladderSteps.length - 1">
            <Icon icon="lsicon:move-up-filled" class="nav-icon" />
            <span v-if="currentStep < ladderSteps.length - 1" class="nav-range">
              {{ ladderSteps[currentStep + 1].label }}
            </span>
          </button>
        </div>

              <div class="ladder-viewport" ref="viewport">
          <div class="ladder-rail"></div>
          <div 
            class="ladder-rail-fill" 
            :style="{ 
              height: pepeUSDAssets.length > 0 ? `calc(100% - ${pepeUSDAssets[0].position}px)` : '0%',
              bottom: '0'
            }"
          ></div>
        
                <!-- USD Value Markers -->
        <div
          v-for="marker in visibleUSDMarkers"
          :key="`usd-${marker.value}`"
          class="usd-marker"
          :class="{ 'marker-reached': marker.value <= pepeUsdPrice, 'marker-unreached': marker.value > pepeUsdPrice }"
          :style="{ top: marker.position + 'px' }"
        >
          <div class="marker-line" :class="{ 'line-reached': marker.value <= pepeUsdPrice, 'line-unreached': marker.value > pepeUsdPrice }"></div>
          <div class="marker-label" :class="{ 'label-reached': marker.value <= pepeUsdPrice, 'label-unreached': marker.value > pepeUsdPrice }">
            ${{ marker.value.toFixed(marker.value >= 1 ? 0 : 2) }}
          </div>
        </div>

        <!-- PepeUSD Marker - Simple design with price, logo and pointer -->
        <div
          v-for="asset in pepeUSDAssets"
          :key="`pepeusd-marker-${asset.symbol}`"
          class="pepeusd-marker"
          :style="{ top: asset.position + 'px' }"
        >
          <div class="pepeusd-content">
            <div class="pepeusd-price">${{ asset.usdValue.toFixed(4) }}</div>
            <div class="pepeusd-logo">
              <img :src="asset.icon" :alt="asset.name" />
            </div>
            <div class="pepeusd-pointer"></div>
          </div>
        </div>

        <!-- Right Side Markers - Crypto and Commodities -->
        <div
          v-for="asset in rightSideAssets"
          :key="`right-marker-${asset.symbol}`"
          class="crypto-marker"
          :style="{ top: asset.position + 'px' }"
        >
          <div class="crypto-content">
            <div class="crypto-pointer"></div>
            <div class="crypto-logo" :style="{ backgroundColor: asset.isCommodity ? asset.color : 'white' }">
              <img v-if="asset.isImage" :src="asset.icon" :alt="asset.name" />
              <span v-else class="commodity-icon" :style="{ color: asset.isCommodity ? 'white' : asset.color }">{{ asset.icon }}</span>
            </div>
            <div class="crypto-price">${{ asset.usdValue >= 1 ? asset.usdValue.toFixed(2) : asset.usdValue.toFixed(4) }}</div>
          </div>
        </div>

        <!-- Other assets on the right -->
        <div 
          v-for="asset in otherAssets" 
          :key="`right-${asset.symbol}`"
          class="ladder-rung ladder-rung-right"
          :style="{ top: asset.position + 'px', minHeight: '80px' }"
        >
          <div class="rung-line rung-line-right"></div>
          <div class="asset-card asset-card-right">
            <div class="asset-icon" :style="{ backgroundColor: asset.color }">
              <img v-if="asset.isImage" :src="asset.icon" :alt="asset.name" class="asset-logo" />
              <span v-else>{{ asset.icon }}</span>
            </div>
            <div class="asset-info">
              <div class="asset-name">{{ asset.name }}</div>
              <div class="asset-symbol">{{ asset.symbol }}</div>
            </div>
            <div class="asset-value">
              <div class="value-amount">${{ asset.usdValue.toFixed(asset.usdValue >= 1 ? 2 : 4) }}</div>
              <div class="value-unit">per USD</div>
              <div v-if="asset.change" class="value-change" :class="asset.change > 0 ? 'positive' : 'negative'">
                {{ asset.change > 0 ? '+' : '' }}{{ asset.change.toFixed(2) }}%
              </div>
            </div>
          </div>
        </div>



        <!-- Floor marker at the bottom -->
      </div>

      <!-- Down Navigation -->
      <div class="ladder-nav ladder-nav-bottom">
        <button @click="scrollDown" class="nav-button nav-down" :disabled="currentStep <= 0">
          <Icon icon="lsicon:move-down-filled" class="nav-icon" />
          <span v-if="currentStep > 0" class="nav-range">
            {{ ladderSteps[currentStep - 1].label }}
          </span>
        </button>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import { Icon } from '@iconify/vue'

export default {
  name: 'App',
  setup() {
    const pepeUsdPrice = ref(2.40)
    const marketCap = ref(0)
    const volume24h = ref(0)
    const lastUpdated = ref('')
    const currentStep = ref(0) // Current step index
    const viewport = ref(null)
    const viewportHeight = ref(0)
    
    // Define the ladder steps
    const ladderSteps = [
      { min: 1, max: 10, label: '$1 - $10' },
      { min: 10, max: 100, label: '$10 - $100' },
      { min: 100, max: 1000, label: '$100 - $1K' },
      { min: 1000, max: 10000, label: '$1K - $10K' },
      { min: 10000, max: 100000, label: '$10K - $100K' },
      { min: 100000, max: 1000000, label: '$100K - $1M' }
    ]
    
    // Assets with their current USD values
    const assets = ref([
      // Fiat
      
      // Commodities (displayed like crypto)
      { name: 'Silver (oz)', symbol: 'XAG', usdValue: 31.50, icon: 'Ag', color: '#9ca3af', change: 0, isCommodity: true, isText: true },
      { name: 'Gold (oz)', symbol: 'XAU', usdValue: 2650.00, icon: 'Au', color: '#f59e0b', change: 0, isCommodity: true, isText: true },
      
      // PepeUSD (special case)
      { name: 'PepeUSD', symbol: 'PEPEUSD', usdValue: 2.40, icon: '/pepeusd-logo.png', color: '#10b981', change: null, isBase: true, isImage: true },
      
      // Cryptocurrencies with CoinGecko symbols and icons
      { name: 'Bitcoin', symbol: 'BTC', cgSymbol: 'bitcoin', usdValue: 98500.00, icon: '/icons/btc.png', color: '#f97316', change: 0, isImage: true, isCrypto: true },
      { name: 'Ethereum', symbol: 'ETH', cgSymbol: 'ethereum', usdValue: 3890.00, icon: '/icons/eth.png', color: '#627eea', change: 0, isImage: true, isCrypto: true },
      { name: 'Solana', symbol: 'SOL', cgSymbol: 'solana', usdValue: 185.00, icon: '/icons/sol.png', color: '#14f195', change: 0, isImage: true, isCrypto: true },
      { name: 'BNB', symbol: 'BNB', cgSymbol: 'binancecoin', usdValue: 715.00, icon: '/icons/bnb.png', color: '#f3ba2f', change: 0, isImage: true, isCrypto: true },
      { name: 'XRP', symbol: 'XRP', cgSymbol: 'ripple', usdValue: 2.45, icon: '/icons/xrp.png', color: '#23292f', change: 0, isImage: true, isCrypto: true },
      { name: 'Uniswap', symbol: 'UNI', cgSymbol: 'uniswap', usdValue: 15.20, icon: '/icons/uni.png', color: '#ff007a', change: 0, isImage: true, isCrypto: true },
      { name: 'Litecoin', symbol: 'LTC', cgSymbol: 'litecoin', usdValue: 110.50, icon: '/icons/ltc.png', color: '#bfbbbb', change: 0, isImage: true, isCrypto: true },
      { name: 'Chainlink', symbol: 'LINK', cgSymbol: 'chainlink', usdValue: 21.80, icon: '/icons/link.png', color: '#375bd2', change: 0, isImage: true, isCrypto: true },
      { name: 'Monero', symbol: 'XMR', cgSymbol: 'monero', usdValue: 195.30, icon: '/icons/xmr.png', color: '#ff6600', change: 0, isImage: true, isCrypto: true },
      { name: 'Ethereum Classic', symbol: 'ETC', cgSymbol: 'ethereum-classic', usdValue: 32.15, icon: '/icons/etc.png', color: '#328332', change: 0, isImage: true, isCrypto: true },
      { name: 'Internet Computer', symbol: 'ICP', cgSymbol: 'internet-computer', usdValue: 12.45, icon: '/icons/icp.png', color: '#29abe2', change: 0, isImage: true, isCrypto: true },
      { name: 'Cosmos', symbol: 'ATOM', cgSymbol: 'cosmos', usdValue: 8.92, icon: '/icons/atom.png', color: '#2e3148', change: 0, isImage: true, isCrypto: true },
      

    ])

    // Get current step info with safety check
    const currentStepInfo = computed(() => {
      const step = ladderSteps[currentStep.value]
      return step || ladderSteps[0] // Fallback to first step if undefined
    })
    
    // Calculate which assets are visible in current step
    const currentStepAssets = computed(() => {
      const step = currentStepInfo.value
      if (!step) return []
      return assets.value.filter(asset => 
        asset.usdValue >= step.min && asset.usdValue < step.max
      )
    })

    // Replace usdToPosition implementation
    const usdToPosition = (usdValue, step) => {
      if (!viewportHeight.value) return 0
      const fraction = (usdValue - step.min) / (step.max - step.min) // 0 at min, 1 at max
      const topMargin = 0
      const bottomMargin = 20 // keep lowest marker fully visible above bottom nav
      return topMargin + (1 - fraction) * (viewportHeight.value - bottomMargin)
    }

    // Assets visible in current step - separated by PepeUSD vs others
    const visibleAssets = computed(() => {
      const step = currentStepInfo.value
      if (!step) return []
      return currentStepAssets.value.map(asset => ({
        ...asset,
        position: usdToPosition(asset.usdValue, step)
      }))
    })

    const pepeUSDAssets = computed(() => visibleAssets.value.filter(asset => asset.symbol === 'PEPEUSD'))
    const cryptoAssets = computed(() => visibleAssets.value.filter(asset => asset.isCrypto))
    const commodityAssets = computed(() => visibleAssets.value.filter(asset => asset.isCommodity))
    const rightSideAssets = computed(() => [...cryptoAssets.value, ...commodityAssets.value])
    const otherAssets = computed(() => visibleAssets.value.filter(asset => asset.symbol !== 'PEPEUSD' && !asset.isCrypto && !asset.isCommodity))

    // USD value markers for current step (linear distribution)
    const visibleUSDMarkers = computed(() => {
      const step = currentStepInfo.value
      if (!step) return []
      const markers = []
      
      // Generate evenly spaced markers based on step range
      let increment
      if (step.max <= 10) increment = 1
      else if (step.max <= 100) increment = 10
      else if (step.max <= 1000) increment = 100
      else if (step.max <= 10000) increment = 1000
      else if (step.max <= 100000) increment = 10000
      else increment = 100000
      
      // Adjust visibleUSDMarkers loop to include step.max
      for (let value = step.min; value <= step.max; value += increment) {
        markers.push({
          value,
          position: usdToPosition(value, step)
        })
      }
      
      return markers
    })

    const formatUSDRange = () => {
      const step = currentStepInfo.value
      return step ? step.label : '$1 - $10'
    }

    const scrollUp = () => {
      if (currentStep.value < ladderSteps.length - 1) {
        currentStep.value++
      }
    }

    const scrollDown = () => {
      if (currentStep.value > 0) {
        currentStep.value--
      }
    }

    // Find the step that contains PepeUSD and set it as current
    const centerOnPepeUSD = () => {
      const pepeUSDValue = assets.value.find(a => a.symbol === 'PEPEUSD')?.usdValue || 2.40
      const stepIndex = ladderSteps.findIndex(step => 
        pepeUSDValue >= step.min && pepeUSDValue < step.max
      )
      if (stepIndex !== -1) {
        currentStep.value = stepIndex
      } else {
        // If PepeUSD doesn't fit in any step, put it in the first step
        currentStep.value = 0
      }
    }

    // Format numbers with appropriate units
    const formatNumber = (num) => {
      if (num >= 1000000000) {
        return (num / 1000000000).toFixed(2) + 'B'
      } else if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M'
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
      } else {
        return num.toFixed(0)
      }
    }

    const updateTimestamp = () => {
      const now = new Date()
      lastUpdated.value = now.toLocaleTimeString('en-US', { 
        hour12: true,
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit'
      })
    }

    const fetchPepeUSDPrice = async () => {
      try {
        console.log('Fetching PepeUSD price from DexScreener...')
        const response = await axios.get('https://api.dexscreener.com/token-pairs/v1/ethereum/0xed7fd16423Bc19b9143313ac5E4B7F731D714e97')
        
        if (response.data && response.data.length > 0) {
          // Find the pair with highest 24h volume for most accurate price
          const bestPair = response.data.reduce((best, current) => {
            const bestVolume = best.volume?.h24 || 0
            const currentVolume = current.volume?.h24 || 0
            return currentVolume > bestVolume ? current : best
          })
          
          const price = parseFloat(bestPair.priceUsd)
          const change24h = bestPair.priceChange?.h24 || null
          const vol24h = bestPair.volume?.h24 || 0
          
          // Calculate market cap (420,000 total supply * current price)
          const totalSupply = 420000
          const calculatedMarketCap = totalSupply * price
          
          // Update PepeUSD asset and metrics
          const pepeAsset = assets.value.find(a => a.symbol === 'PEPEUSD')
          if (pepeAsset && price > 0) {
            pepeAsset.usdValue = price
            pepeAsset.change = change24h
            pepeUsdPrice.value = price
            marketCap.value = calculatedMarketCap
            volume24h.value = vol24h
            
            console.log(`PepeUSD price updated: $${price} | Market Cap: $${calculatedMarketCap.toLocaleString()} | 24h Volume: $${vol24h.toLocaleString()}`)
          }
        }
      } catch (error) {
        console.error('Error fetching PepeUSD price:', error)
        // Fallback to small simulation if API fails
        const pepeAsset = assets.value.find(a => a.symbol === 'PEPEUSD')
        if (pepeAsset) {
          const fluctuation = (Math.random() - 0.5) * 0.01 // 1% max fluctuation as fallback
          pepeAsset.usdValue *= (1 + fluctuation)
          pepeUsdPrice.value = pepeAsset.usdValue
        }
      }
    }

    const fetchCryptoPrices = async () => {
      try {
        console.log('Fetching crypto prices from CoinGecko...')
        
        // Get all crypto symbols for CoinGecko API
        const cryptoAssets = assets.value.filter(asset => asset.isCrypto)
        const coinIds = cryptoAssets.map(asset => asset.cgSymbol).join(',')
        
        const response = await axios.get(`https://pro-api.coingecko.com/api/v3/simple/price`, {
          params: {
            ids: coinIds,
            vs_currencies: 'usd',
            include_24hr_change: true
          },
          headers: {
            'x-cg-pro-api-key': 'CG-H4xieUBo2ELMNvdb3S8swXhU'
          }
        })

        if (response.data) {
          // Update crypto asset prices
          cryptoAssets.forEach(asset => {
            const coinData = response.data[asset.cgSymbol]
            if (coinData) {
              asset.usdValue = coinData.usd
              asset.change = coinData.usd_24h_change || 0
              console.log(`${asset.symbol} price updated: $${coinData.usd}`)
            }
          })
        }
      } catch (error) {
        console.error('Error fetching crypto prices:', error)
        // Fallback to small simulation if API fails
        const cryptoAssets = assets.value.filter(asset => asset.isCrypto)
        cryptoAssets.forEach(asset => {
          const fluctuation = (Math.random() - 0.5) * 0.02 // 2% max fluctuation
          asset.usdValue *= (1 + fluctuation)
          asset.change += (Math.random() - 0.5) * 0.5
        })
      }
    }

    const simulateOtherPrices = () => {
      // Simulate small price fluctuations for non-crypto assets and commodities (not USD markers or PepeUSD)
      assets.value.forEach(asset => {
        if (!asset.symbol.startsWith('USD') && asset.symbol !== 'PEPEUSD' && !asset.isCrypto) {
          const fluctuation = (Math.random() - 0.5) * 0.02 // 2% max fluctuation
          asset.usdValue *= (1 + fluctuation)
          if (asset.change !== null) {
            asset.change += (Math.random() - 0.5) * 0.5
          }
        }
        // Simulate commodity price changes
        if (asset.isCommodity) {
          const fluctuation = (Math.random() - 0.5) * 0.015 // 1.5% max fluctuation for commodities
          asset.usdValue *= (1 + fluctuation)
          asset.change += (Math.random() - 0.5) * 0.3
        }
      })
    }

    const updatePrices = async () => {
      await Promise.all([
        fetchPepeUSDPrice(),
        fetchCryptoPrices()
      ])
      simulateOtherPrices()
      updateTimestamp()
    }

    let updateInterval

    onMounted(async () => {
      updateTimestamp()
      
      // Initial price fetch
      await updatePrices()
      
      // Center on PepeUSD after we have the real price
      centerOnPepeUSD()
      
      // Update prices every minute (60 seconds)
      updateInterval = setInterval(updatePrices, 60000)

      const updateViewportHeight = () => {
        if (viewport.value) {
          viewportHeight.value = viewport.value.clientHeight
        }
      }
      updateViewportHeight()
      window.addEventListener('resize', updateViewportHeight)
    })

    onUnmounted(() => {
      if (updateInterval) {
        clearInterval(updateInterval)
      }
      window.removeEventListener('resize', updateViewportHeight)
    })

    return {
      pepeUsdPrice,
      marketCap,
      volume24h,
      lastUpdated,
      assets,
      visibleAssets,
      pepeUSDAssets,
      cryptoAssets,
      commodityAssets,
      rightSideAssets,
      otherAssets,
      visibleUSDMarkers,
      currentStep,
      ladderSteps,
      viewport,
      formatUSDRange,
      formatNumber,
      currentStepInfo,
      scrollUp,
      scrollDown
    }
  },
  components: {
    Icon
  }
}
</script>

<style scoped>
.app {
  background: white;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  width: 100%;
  height: 100vh;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  position: relative;
}

.header {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  padding: 24px 24px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 100;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
}

.header-left {
  flex: 0 0 70%;
  min-width: 0;
}

.header-right {
  flex: 0 0 30%;
  min-width: 0;
  text-align: left;
  padding-left: 24px;
}

.title-container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  margin-bottom: 12px;
}

.title-logo {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  object-fit: contain;
}

.title-link {
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
}

.title-link:hover {
  opacity: 0.8;
  transform: translateY(-1px);
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  cursor: pointer;
}

.external-links {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.external-link {
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(16, 185, 129, 0.2);
  transition: all 0.2s ease;
}

.external-link:hover {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  border-color: #10b981;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
}

.link-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.current-price {
  margin-bottom: 8px;
  text-align: left;
}

.price-label {
  font-size: 14px;
  color: #475569;
  margin-right: 8px;
}

.price-value {
  font-size: 22px;
  font-weight: 700;
  color: #10b981;
}

.market-metrics {
  display: flex;
  justify-content: flex-start;
  gap: 20px;
  margin-bottom: 8px;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.metric-label {
  font-size: 11px;
  color: #64748b;
  margin-bottom: 2px;
}

.metric-value {
  font-size: 13px;
  font-weight: 600;
  color: #10b981;
}

.last-updated {
  font-size: 10px;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 4px;
}

.update-icon {
  font-size: 14px;
  color: #64748b;
}

.ladder-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  background: #fafafa;
  overflow: hidden;
  position: relative;
}

.ladder-nav {
  display: flex;
  align-items: center;
  padding: 0;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: sticky;
  z-index: 50;
  min-height: 35px;
}

.ladder-nav-top {
  top: 0;
  border-bottom: 1px solid #e2e8f0;
}

.ladder-nav-bottom {
  bottom: 0;
  border-top: 1px solid #e2e8f0;
}

.nav-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  min-height: 50px;
  gap: 8px;
}

.nav-button:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.1);
}

.nav-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-icon {
  font-size: 18px;
  color: #475569;
  flex-shrink: 0;
}

.nav-range {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
}

.ladder-viewport {
  position: relative;
  flex: 1;
  overflow: hidden;
  background: linear-gradient(to bottom, #fafafa, #f1f5f9);
}

.ladder-rail {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 0;
  bottom: 0;
  width: 8px;
  background: linear-gradient(to bottom, #e5e7eb, #d1d5db, #9ca3af);
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.ladder-rail-fill {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  background: linear-gradient(to top, #10b981, #059669, #047857);
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: height 0.3s ease;
  z-index: 1;
}

.usd-marker {
  position: absolute;
  left: calc(50% + 10px);
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  pointer-events: none;
  z-index: 10;
}

.marker-line {
  width: 20px;
  height: 2px;
  background: linear-gradient(to right, #10b981, transparent);
  margin-left: 55px;
  border-radius: 2px;
  opacity: 0.8;
}

.marker-label {
  font-size: 12px;
  color: #059669;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
  width: 65px;
  text-align: center;
  border: 1px solid rgba(16, 185, 129, 0.2);
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
}

/* Reached markers (PepeUSD is above this level) */
.marker-reached {
  z-index: 12;
}

.line-reached {
  background: linear-gradient(to right, #10b981, transparent);
  opacity: 1;
}

.label-reached {
  color: #047857;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid #10b981;
  font-weight: 600;
}

/* Unreached markers (PepeUSD hasn't reached this level yet) */
.marker-unreached {
  opacity: 0.4;
  z-index: 8;
}

.line-unreached {
  background: linear-gradient(to right, #9ca3af, transparent);
  opacity: 0.6;
}

.label-unreached {
  color: #6b7280;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(156, 163, 175, 0.3);
  font-weight: 400;
}





.sky-marker, .floor-marker {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  pointer-events: none;
  background: rgba(255, 255, 255, 0.95);
  padding: 12px 20px;
  border-radius: 20px;
  border: 2px solid #10b981;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.sky-icon, .floor-icon {
  font-size: 24px;
  margin-right: 16px;
}

.sky-text, .floor-text {
  color: #64748b;
}

.sky-title, .floor-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.sky-subtitle, .floor-subtitle {
  font-size: 12px;
  color: #64748b;
}

.sky-icon {
  font-size: 24px;
  margin-right: 16px;
}

.sky-text {
  flex: 1;
}

.sky-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.sky-subtitle {
  font-size: 14px;
  color: #64748b;
}

.ladder-rung {
  position: absolute;
  width: 45%;
}

.ladder-rung-left {
  right: 52%;
  text-align: right;
}

.ladder-rung-right {
  left: 52%;
  text-align: left;
}

.ladder-rung.highlight .asset-card {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  transform: scale(1.02);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
}

.ladder-rung.highlight .asset-icon {
  background: rgba(255, 255, 255, 0.2) !important;
  color: white !important;
}

.ladder-rung.highlight .value-unit {
  color: rgba(255, 255, 255, 0.8) !important;
}

.rung-line {
  position: absolute;
  top: 50%;
  width: 25px;
  height: 4px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 2px;
  transform: translateY(-50%);
  z-index: 5;
}

.rung-line-left {
  right: -29px;
}

.rung-line-right {
  left: -29px;
}

.asset-card {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
}

.asset-card-left {
  flex-direction: row-reverse;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border-color: rgba(255, 255, 255, 0.8);
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
}

.asset-card-left .asset-value {
  text-align: left;
  margin-right: 16px;
}

.asset-card-left .asset-info {
  text-align: right;
}

.asset-card-left .value-unit {
  color: rgba(255, 255, 255, 0.9);
}

.asset-card-right {
  border-color: rgba(16, 185, 129, 0.3);
}

.asset-card-right:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  border-color: #10b981;
}

.asset-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.2);
}

/* PepeUSD Marker Styles */
.pepeusd-marker {
  position: absolute;
  left: calc(50% - 75px);
  margin-top: 3px;
  transform: translateY(-50%);
  z-index: 10;
}

.pepeusd-content {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  right: 120px; /* Position to the left of the ladder */
}

.pepeusd-price {
  font-size: 18px;
  font-weight: 700;
  color: #10b981;
  background: white;
  padding: 4px 8px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid #10b981;
}

.pepeusd-logo {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid #10b981;
}

.pepeusd-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pepeusd-pointer {
  width: 0;
  height: 0;
  border-left: 12px solid #10b981;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  margin-left: 4px;
}

/* Crypto Marker Styles - Right side */
.crypto-marker {
  position: absolute;
  left: calc(50% + 20px);
  transform: translateY(-50%);
  z-index: 10;
}

.crypto-content {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.crypto-pointer {
  width: 0;
  height: 0;
  border-right: 12px solid #374151;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  margin-right: 4px;
}

.crypto-logo {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid #374151;
}

.crypto-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.crypto-price {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  background: white;
  padding: 4px 8px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid #374151;
  min-width: 80px;
  text-align: center;
}

.commodity-icon {
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.asset-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  color: white;
  margin-right: 16px;
  flex-shrink: 0;
}

.asset-info {
  flex: 1;
  min-width: 0;
}

.asset-name {
  font-weight: 600;
  font-size: 16px;
  color: #1e293b;
  margin-bottom: 2px;
}

.asset-symbol {
  font-size: 14px;
  color: #64748b;
}

.asset-value {
  text-align: right;
  flex-shrink: 0;
}

.value-amount {
  font-weight: 700;
  font-size: 16px;
  color: #1e293b;
  margin-bottom: 2px;
}

.value-unit {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
}

.value-change {
  font-size: 12px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
}

.value-change.positive {
  background: #dcfce7;
  color: #166534;
}

.value-change.negative {
  background: #fef2f2;
  color: #dc2626;
}



.asset-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

@media (max-width: 640px) {
  .app {
    border-radius: 0;
    height: 100vh;
    width: 100vw !important;
    min-width: unset !important;
  }
  
  .header {
    padding: 20px 16px 16px;
    border-radius: 0;
    gap: 16px;
  }
  
  .header-left {
    flex: 0 0 50% !important;
  }

  .header-right {
    flex: 0 0 50% !important;
  }
  
  .price-value {
    font-size: 18px;
  }
  
  .market-metrics {
    gap: 12px;
  }
  
  .external-links {
    gap: 8px;
  }
  
  .external-link {
    font-size: 11px;
    padding: 4px 6px;
  }
  
  .external-link span {
    display: none;
  }
  
  .link-icon {
    font-size: 16px;
  }
  
  .title {
    font-size: 18px;
  }
  
  .title-logo {
    width: 40px;
    height: 40px;
  }
  
  .ladder-nav {
    min-height: 40px;
  }
  
  .nav-button {
    padding: 8px 12px;
    min-height: 40px;
    gap: 6px;
  }
  
  .nav-icon {
    font-size: 16px;
  }
  
  .nav-range {
    font-size: 11px;
  }
  
  .ladder-rung {
    width: 42%;
  }
  
  .ladder-rung-left {
    right: 54%;
  }

  .ladder-rung-right {
    left: 54%;
  }
  
  .asset-card {
    padding: 12px;
  }
  
  .asset-card-left .asset-icon,
  .asset-card-right .asset-icon {
    width: 35px;
    height: 35px;
  }
  

}
</style> 