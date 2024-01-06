module Main exposing (main)

import Browser
import Browser.Events exposing (onKeyDown)
import Html exposing (Html, a, div, text)
import Html.Attributes exposing (attribute, style)
import Json.Decode
import Random
import Task
import Time


type Tetrimino
    = I
    | O
    | T
    | S
    | Z
    | J
    | L


type alias Board =
    List (List Bool)


type alias Position =
    { x : Int, y : Int }


type Direction
    = Zero
    | Ninety
    | OneEighty
    | TwoSeventy


type alias Flags =
    ()


type alias Model =
    { board : Board
    , currentTetrimino : Tetrimino
    , position : Position
    , direction : Direction
    , lines : Int
    , msg : Msg
    , tick : Int
    , seed : Random.Seed
    }


type Msg
    = Tick
    | MoveDown
    | MoveLeft
    | MoveRight
    | Rotate
    | EraseLines
    | IsGameOver
    | NoOp


init : Flags -> ( Model, Cmd Msg )
init _ =
    let
        ( tetrimino, seed ) =
            Random.step randomTetrimino (Random.initialSeed 0)
    in
    ( { board = List.repeat 20 (List.repeat 10 False)
      , currentTetrimino = tetrimino
      , position = initialPosition tetrimino
      , direction = Zero
      , lines = 0
      , msg = NoOp
      , tick = 0
      , seed = seed
      }
    , Cmd.none
    )


initialPosition : Tetrimino -> Position
initialPosition tetrimino =
    case tetrimino of
        I ->
            { x = 4, y = 0 }

        O ->
            { x = 4, y = 0 }

        T ->
            { x = 4, y = 0 }

        S ->
            { x = 4, y = 0 }

        Z ->
            { x = 4, y = 0 }

        J ->
            { x = 4, y = 0 }

        L ->
            { x = 4, y = 0 }


view : Model -> Html Msg
view model =
    div
        []
        [ div []
            [ text "Elm Tetris: "
            , a [ attribute "href" "https://github.com/satosystems/tetris/tree/main/elm" ] [ text "GitHub" ]
            ]
        , div
            [ style "display" "grid"
            , style "grid-template-columns" "repeat(10, 30px)"
            , style "grid-template-rows" "repeat(20, 30px)"
            ]
            (List.concatMap (viewRow model) (List.indexedMap (\y row -> ( y, row )) model.board))
        , div []
            [ text ("Lines: " ++ String.fromInt model.lines)
            ]
        ]


viewRow : Model -> ( Int, List Bool ) -> List (Html Msg)
viewRow model ( y, row ) =
    List.indexedMap (viewCell model y) row


viewCell : Model -> Int -> Int -> Bool -> Html Msg
viewCell model y x cell =
    let
        isTetriminoCell =
            isCellPartOfTetrimino model ( x, y )
    in
    div
        [ style "width" "30px"
        , style "height" "30px"
        , style "border" "1px solid black"
        , style "background-color"
            (if cell || isTetriminoCell then
                "grey"

             else
                "white"
            )
        ]
        []


isCellPartOfTetrimino : Model -> ( Int, Int ) -> Bool
isCellPartOfTetrimino model ( x, y ) =
    let
        shape =
            tetriminoShape model

        position =
            model.position
    in
    List.any (\( dx, dy ) -> position.x + dx == x && position.y + dy == y) shape


keyDecoder : Json.Decode.Decoder Msg
keyDecoder =
    let
        toDirection key =
            case key of
                "ArrowDown" ->
                    MoveDown

                "ArrowLeft" ->
                    MoveLeft

                "ArrowRight" ->
                    MoveRight

                "ArrowUp" ->
                    Rotate

                _ ->
                    NoOp
    in
    Json.Decode.map toDirection (Json.Decode.field "key" Json.Decode.string)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    let
        newModel =
            { model | msg = msg }
    in
    case msg of
        Tick ->
            let
                tickModel =
                    { newModel | tick = newModel.tick + 1 }
            in
            if tickModel.tick < 100 then
                ( tickModel, Task.succeed NoOp |> Task.perform identity )

            else if isCollision tickModel then
                let
                    fixedModel =
                        fixTetrimino tickModel

                    fixTetrimino aModel =
                        let
                            newBoard =
                                List.map
                                    (updateRow aModel)
                                    (List.indexedMap (\i row -> ( i, row )) aModel.board)
                        in
                        { aModel | board = newBoard }

                    updateRow aModel ( y, row ) =
                        List.indexedMap
                            (\x cell ->
                                if isCellPartOfTetrimino aModel ( x, y ) then
                                    True

                                else
                                    cell
                            )
                            row

                    ( newTetrimino, seed ) =
                        Random.step randomTetrimino tickModel.seed
                in
                ( { fixedModel
                    | currentTetrimino = newTetrimino
                    , position = initialPosition newTetrimino
                    , msg = EraseLines
                    , tick = 0
                    , seed = seed
                  }
                , Cmd.none
                )

            else
                ( { tickModel
                    | position = { x = tickModel.position.x, y = tickModel.position.y + 1 }
                    , tick = 0
                  }
                , Cmd.none
                )

        MoveDown ->
            ( { newModel | tick = 100 }, Task.succeed Tick |> Task.perform identity )

        MoveLeft ->
            if isCollision newModel then
                ( newModel, Cmd.none )

            else
                ( { newModel
                    | position = { x = newModel.position.x - 1, y = newModel.position.y }
                  }
                , Cmd.none
                )

        MoveRight ->
            if isCollision newModel then
                ( newModel, Cmd.none )

            else
                ( { newModel
                    | position = { x = newModel.position.x + 1, y = newModel.position.y }
                  }
                , Cmd.none
                )

        Rotate ->
            let
                tryRotate offsets =
                    case offsets of
                        [] ->
                            Nothing

                        x :: xs ->
                            let
                                tryModel =
                                    rotateTetrimino
                                        { newModel
                                            | position = { x = newModel.position.x + x, y = newModel.position.y }
                                        }
                            in
                            if (x == -2 && tryModel.currentTetrimino /= I) || isCollision tryModel then
                                tryRotate xs

                            else
                                Just tryModel
            in
            case
                tryRotate
                    [ 0, -1, 1, -2 ]
            of
                Nothing ->
                    ( newModel, Cmd.none )

                Just rotatedModel ->
                    ( rotatedModel, Cmd.none )

        EraseLines ->
            let
                ( lines, newBoard ) =
                    eraseRows newModel.board

                eraseRows board =
                    let
                        isFillRow row =
                            List.all (\cell -> cell) row

                        erasedBoard =
                            List.filter (\row -> not (isFillRow row)) board

                        erasedLines =
                            List.length board - List.length erasedBoard

                        emptyLines =
                            List.repeat erasedLines (List.repeat 10 False)
                    in
                    ( erasedLines, emptyLines ++ erasedBoard )
            in
            ( { newModel
                | board = newBoard
                , lines = newModel.lines + lines
                , msg = IsGameOver
              }
            , Cmd.none
            )

        IsGameOver ->
            if isCollision newModel then
                let
                    ( tetrimino, seed ) =
                        Random.step randomTetrimino newModel.seed
                in
                ( { board = List.repeat 20 (List.repeat 10 False)
                  , currentTetrimino = tetrimino
                  , position = initialPosition tetrimino
                  , direction = Zero
                  , lines = 0
                  , msg = NoOp
                  , tick = 0
                  , seed = seed
                  }
                , Cmd.none
                )

            else
                ( { newModel
                    | msg = NoOp
                  }
                , Cmd.none
                )

        NoOp ->
            ( newModel, Cmd.none )


randomTetrimino : Random.Generator Tetrimino
randomTetrimino =
    Random.uniform I [ O, T, S, Z, J, L ]


subscriptions : Model -> Sub Msg
subscriptions model =
    let
        collided =
            isCollision model
    in
    Sub.batch
        [ Time.every 10
            (always
                (if collided then
                    IsGameOver

                 else if model.msg == EraseLines then
                    EraseLines

                 else
                    Tick
                )
            )
        , if collided then
            Sub.none

          else
            onKeyDown keyDecoder
        ]


isCollision : Model -> Bool
isCollision model =
    let
        shape =
            tetriminoShape model

        newPosition =
            case model.msg of
                MoveLeft ->
                    { x = model.position.x - 1, y = model.position.y }

                MoveRight ->
                    { x = model.position.x + 1, y = model.position.y }

                Tick ->
                    { x = model.position.x, y = model.position.y + 1 }

                _ ->
                    model.position
    in
    List.any
        (\( dx, dy ) ->
            let
                cellX =
                    newPosition.x + dx

                cellY =
                    newPosition.y + dy

                cellFilled =
                    case getAt cellY model.board of
                        Just row ->
                            case getAt cellX row of
                                Just filled ->
                                    filled

                                Nothing ->
                                    False

                        Nothing ->
                            False

                getAt : Int -> List a -> Maybe a
                getAt index list =
                    list
                        |> List.drop index
                        |> List.head
            in
            cellY >= 20 || cellX < 0 || cellX >= 10 || cellFilled
        )
        shape


tetriminoShape : Model -> List ( Int, Int )
tetriminoShape model =
    case ( model.currentTetrimino, model.direction ) of
        ( I, Zero ) ->
            [ ( 0, 0 ), ( 0, -1 ), ( 0, 1 ), ( 0, 2 ) ]

        ( I, Ninety ) ->
            [ ( 0, 0 ), ( -1, 0 ), ( 1, 0 ), ( 2, 0 ) ]

        ( I, OneEighty ) ->
            [ ( 0, 0 ), ( 0, -1 ), ( 0, 1 ), ( 0, 2 ) ]

        ( I, TwoSeventy ) ->
            [ ( 0, 0 ), ( -1, 0 ), ( 1, 0 ), ( 2, 0 ) ]

        ( O, Zero ) ->
            [ ( 0, 0 ), ( 1, 0 ), ( 0, 1 ), ( 1, 1 ) ]

        ( O, Ninety ) ->
            [ ( 0, 0 ), ( 1, 0 ), ( 0, 1 ), ( 1, 1 ) ]

        ( O, OneEighty ) ->
            [ ( 0, 0 ), ( 1, 0 ), ( 0, 1 ), ( 1, 1 ) ]

        ( O, TwoSeventy ) ->
            [ ( 0, 0 ), ( 1, 0 ), ( 0, 1 ), ( 1, 1 ) ]

        ( T, Zero ) ->
            [ ( 0, 0 ), ( -1, 0 ), ( 1, 0 ), ( 0, 1 ) ]

        ( T, Ninety ) ->
            [ ( 0, 0 ), ( 0, -1 ), ( 0, 1 ), ( 1, 0 ) ]

        ( T, OneEighty ) ->
            [ ( 0, 0 ), ( -1, 0 ), ( 1, 0 ), ( 0, -1 ) ]

        ( T, TwoSeventy ) ->
            [ ( 0, 0 ), ( 0, -1 ), ( 0, 1 ), ( -1, 0 ) ]

        ( S, Zero ) ->
            [ ( 0, 0 ), ( -1, 0 ), ( 0, -1 ), ( 1, -1 ) ]

        ( S, Ninety ) ->
            [ ( 0, 0 ), ( 0, -1 ), ( 1, 0 ), ( 1, 1 ) ]

        ( S, OneEighty ) ->
            [ ( 0, 0 ), ( -1, 0 ), ( 0, -1 ), ( 1, -1 ) ]

        ( S, TwoSeventy ) ->
            [ ( 0, 0 ), ( 0, -1 ), ( 1, 0 ), ( 1, 1 ) ]

        ( Z, Zero ) ->
            [ ( 0, 0 ), ( 1, 0 ), ( 0, -1 ), ( -1, -1 ) ]

        ( Z, Ninety ) ->
            [ ( 0, 0 ), ( 0, -1 ), ( -1, 0 ), ( -1, 1 ) ]

        ( Z, OneEighty ) ->
            [ ( 0, 0 ), ( 1, 0 ), ( 0, -1 ), ( -1, -1 ) ]

        ( Z, TwoSeventy ) ->
            [ ( 0, 0 ), ( 0, -1 ), ( -1, 0 ), ( -1, 1 ) ]

        ( J, Zero ) ->
            [ ( 0, 0 ), ( 1, 0 ), ( -1, 0 ), ( 1, 1 ) ]

        ( J, Ninety ) ->
            [ ( 0, 0 ), ( 0, -1 ), ( 0, 1 ), ( 1, -1 ) ]

        ( J, OneEighty ) ->
            [ ( 0, 0 ), ( -1, 0 ), ( 1, 0 ), ( -1, -1 ) ]

        ( J, TwoSeventy ) ->
            [ ( 0, 0 ), ( 0, -1 ), ( 0, 1 ), ( -1, 1 ) ]

        ( L, Zero ) ->
            [ ( 0, 0 ), ( -1, 0 ), ( 1, 0 ), ( -1, 1 ) ]

        ( L, Ninety ) ->
            [ ( 0, 0 ), ( 0, -1 ), ( 0, 1 ), ( 1, 1 ) ]

        ( L, OneEighty ) ->
            [ ( 0, 0 ), ( -1, 0 ), ( 1, 0 ), ( 1, -1 ) ]

        ( L, TwoSeventy ) ->
            [ ( 0, 0 ), ( 0, -1 ), ( 0, 1 ), ( -1, -1 ) ]


rotateTetrimino : Model -> Model
rotateTetrimino model =
    let
        newDirection =
            case model.direction of
                Zero ->
                    Ninety

                Ninety ->
                    OneEighty

                OneEighty ->
                    TwoSeventy

                TwoSeventy ->
                    Zero
    in
    { model | direction = newDirection }


main : Program Flags Model Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }
