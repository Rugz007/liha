package main

import (
	"context"
	"embed"
	"os"
	"strings"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

//go:embed all:frontend/dist
var assets embed.FS
var wailsContext *context.Context

func (a *App) onSecondInstanceLaunch(secondInstanceData options.SecondInstanceData) {
	secondInstanceArgs := secondInstanceData.Args

	println("user opened second instance", strings.Join(secondInstanceData.Args, ","))
	println("user opened second from", secondInstanceData.WorkingDirectory)
	runtime.WindowUnminimise(*wailsContext)
	runtime.Show(*wailsContext)
	go runtime.EventsEmit(*wailsContext, "launchArgs", secondInstanceArgs)
}

func main() {
	// Create an instance of the app structure
	app := NewApp()

	icon, err := os.ReadFile("build/appicon.png")
	if err != nil {
		println("Error reading icon file:", err.Error())
	}
	// Create application with options
	err = wails.Run(&options.App{
		Title:  "2b",
		Width:  1920,
		Height: 1080,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour:  &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:         app.startup,
		HideWindowOnClose: true,
		Bind: []interface{}{
			app,
		},
		Mac: &mac.Options{
			TitleBar: &mac.TitleBar{
				TitlebarAppearsTransparent: true,
				HideTitle:                  true,
				HideTitleBar:               false,
				FullSizeContent:            true,
				UseToolbar:                 true,
				HideToolbarSeparator:       true,
			},
			About: &mac.AboutInfo{
				Title:   "2b",
				Message: "2b is a desktop app for managing your tasks.",
				Icon:    icon,
			},
		},
		SingleInstanceLock: &options.SingleInstanceLock{
			UniqueId:               "e3984e08-28dc-4e3d-b70a-45e961589cdc",
			OnSecondInstanceLaunch: app.onSecondInstanceLaunch,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}

}
